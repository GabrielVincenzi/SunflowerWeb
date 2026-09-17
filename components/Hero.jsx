"use client";
import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, Float, Environment, ContactShadows, useGLTF } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const MODEL_PATH = "/iphone/iphone.gltf";
const SCREEN_MESH_NAME = "baf05346569e3be49c2a";
const WORLD_SPACE_NUDGE = 0.081;
const PX_PER_UNIT = 40;
useGLTF.preload(MODEL_PATH);

// Target size (in scene units) the model gets normalized to, so restScale/cameraZ
// keep meaning identical to the old procedural box regardless of the GLTF's native units.
const TARGET_HEIGHT = 3.32;

// ────────────────────────────────────────────────────────────────────────
// Loaded phone body: normalizes scale/origin, applies materials, and
// locates the screen mesh so <Html> can be placed exactly on it.
// ────────────────────────────────────────────────────────────────────────
function PhoneMesh({ children }) {
    const meshGroupRef = useRef(null);

    const { scene } = useGLTF(MODEL_PATH);

    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    const { normalizedScale, pivotOffset } = useMemo(() => {
        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
        return { normalizedScale: scale, pivotOffset: [-center.x, -center.y, -center.z] };
    }, [clonedScene]);

    const [screenTransform, setScreenTransform] = useState(null);

    // ── Screen mesh: locate, hide, compute position/rotation/size ──────────
    useEffect(() => {
        if (!meshGroupRef.current) return;
        let screenMesh = null;

        clonedScene.traverse((obj) => {
            if (!obj.isMesh) return;

            const n = obj.name;

            if (obj.material && n !== SCREEN_MESH_NAME) {
                obj.material.envMapIntensity = 1.1;
            }
            obj.castShadow = true;
            obj.receiveShadow = true;

            if (n === SCREEN_MESH_NAME) {
                screenMesh = obj;
            }
        });

        screenMesh.visible = false;

        meshGroupRef.current.updateMatrixWorld(true);
        screenMesh.updateMatrixWorld(true);

        // Position + rotation of screenMesh relative to the SAME group that
        // <Html> lives in (meshGroupRef), preserving rotation — not just position.
        const groupInverse = meshGroupRef.current.matrixWorld.clone().invert();
        const relativeMatrix = new THREE.Matrix4().multiplyMatrices(groupInverse, screenMesh.matrixWorld);

        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        relativeMatrix.decompose(position, quaternion, scale);
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        // Nudge the plane outward along the mesh's OWN local normal (via its
        // quaternion), not blind world-Z — otherwise the offset can push the
        // plane backward into the phone body and get self-occluded (invisible).
        const localOffset = new THREE.Vector3(0, 0, WORLD_SPACE_NUDGE / normalizedScale).applyQuaternion(quaternion);
        position.add(localOffset);

        // Size measured in the mesh's OWN local space, from raw geometry —
        // not a world-space axis-aligned box, so rotation can't inflate/skew it.
        const localBox = new THREE.Box3().setFromBufferAttribute(
            screenMesh.geometry.attributes.position
        );
        const size = new THREE.Vector3();
        localBox.getSize(size);
        size.multiply(screenMesh.scale);

        // Guard against NaN/zero — these fail SILENTLY in <Html transform>,
        // which is exactly what makes "disappears with no error" so confusing.
        const allFinite = [position.x, position.y, position.z, euler.x, euler.y, euler.z, size.x, size.y]
            .every(Number.isFinite);

        if (!allFinite || size.x === 0 || size.y === 0) {
            console.error("[PhoneMesh] Invalid screen transform computed:", {
                position: position.toArray(),
                rotation: euler.toArray(),
                size: size.toArray(),
            });
            return;
        }

        setScreenTransform({
            position: [position.x, position.y, position.z],
            rotation: [euler.x, euler.y, euler.z],
            size: [size.x, size.y],
        });
    }, [clonedScene]);

    const BODY_MESH_NAMES = new Set([
        'ec8f03089e5e1a54d8db',
        'ebc339b99475efa5174c',
        'f3900596a9052dcb9f7e',
        '9098d6c8e67d765bddef',
        'b71ded67658172ddf8eb',
        'e3a6c9417b4935be6f1f',
        '0d65a2b6dd06c454ddfa',
        '141021ca0becd9ed6dbe',

        '92b17cae6abca19c4de6',

    ]);

    const SECONDARY_MESH_NAMES = new Set([
        '85f91bea2bfe5b75ec89',
        '2544f5343596116b3326',
        '311318fcdb4adc8f5147',

        'fc43fe86eee65edbdbce',
        '3387d7789353c1e122d8',
        'ef46d8c576ebc97d661b',

        '29feb9e8dfb497a018e2',
    ]);

    let sharedBodyMaterial = null;

    clonedScene.traverse((obj) => {
        if (!obj.isMesh || !BODY_MESH_NAMES.has(obj.name)) return;

        if (!sharedBodyMaterial) {
            sharedBodyMaterial = obj.material.clone();
            sharedBodyMaterial.color.set("#0a0a0a");
            sharedBodyMaterial.transparent = false;
            sharedBodyMaterial.opacity = 1;
            sharedBodyMaterial.depthWrite = true;
            if ("transmission" in sharedBodyMaterial) sharedBodyMaterial.transmission = 0;
            if ("ior" in sharedBodyMaterial) sharedBodyMaterial.ior = 1.0;
            if ("thickness" in sharedBodyMaterial) sharedBodyMaterial.thickness = 0;
            sharedBodyMaterial.emissive.set("black");
            sharedBodyMaterial.metalness = 0.15;
            sharedBodyMaterial.roughness = 0.7;
            sharedBodyMaterial.needsUpdate = true;
        }

        obj.material = sharedBodyMaterial;
    });


    let sharedSecondaryMaterial = null;

    clonedScene.traverse((obj) => {
        if (!obj.isMesh || !SECONDARY_MESH_NAMES.has(obj.name)) return;

        if (!sharedSecondaryMaterial) {
            sharedSecondaryMaterial = obj.material.clone();
            sharedSecondaryMaterial.color.set("#2F2F2F"); // warm off-white, like your product's cream/paper background
            sharedSecondaryMaterial.transparent = false;
            sharedSecondaryMaterial.opacity = 1;
            sharedSecondaryMaterial.depthWrite = true;
            if ("transmission" in sharedSecondaryMaterial) sharedSecondaryMaterial.transmission = 0;
            if ("ior" in sharedSecondaryMaterial) sharedSecondaryMaterial.ior = 1.0;
            if ("thickness" in sharedSecondaryMaterial) sharedSecondaryMaterial.thickness = 0;
            sharedSecondaryMaterial.emissive.set("black");
            sharedSecondaryMaterial.metalness = 0.4;   // brushed-aluminum trim look
            sharedSecondaryMaterial.roughness = 0.35;
            sharedSecondaryMaterial.needsUpdate = true;
        }

        obj.material = sharedSecondaryMaterial;
    });

    return (
        <group ref={meshGroupRef} scale={normalizedScale} position={pivotOffset}>
            <primitive object={clonedScene} />
            {screenTransform && (
                <Html
                    transform
                    occlude="blending"
                    position={screenTransform.position}
                    rotation={screenTransform.rotation}
                    style={{ pointerEvents: "none" }}
                >
                    <div
                        style={{
                            width: `${screenTransform.size[0] * PX_PER_UNIT}px`,
                            height: `${screenTransform.size[1] * PX_PER_UNIT}px`,
                            overflow: "hidden",
                            borderRadius: "30px",
                            display: "flex",
                        }}
                    >
                        {children}
                    </div>
                </Html>
            )}
        </group>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Outer rig — same GSAP contract as before: groupRef.position/rotation/scale
// ────────────────────────────────────────────────────────────────────────
function PhoneModel({ children, entranceDelay = 0.2, restScale = 0.7 }) {
    const groupRef = useRef(null);

    useGSAP(() => {
        if (!groupRef.current) return;

        const entranceTl = gsap.timeline({
            defaults: { duration: 1.6, ease: "power3.out", delay: entranceDelay }
        });

        entranceTl.fromTo(groupRef.current.position, { x: -0.6, y: -4 }, { x: 0, y: -0.6, duration: 3.2 });
        entranceTl.fromTo(groupRef.current.rotation, { x: 0, y: -2, z: 0.4 }, { x: 0, y: -0.5, z: -0.4, ease: "power1.out" }, 0);
        entranceTl.fromTo(
            groupRef.current.scale,
            { x: restScale * 0.85, y: restScale * 0.85, z: restScale * 0.85 },
            { x: restScale, y: restScale, z: restScale },
            0
        );

        const scrollTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".sf-hero",
                start: "top top",
                endTrigger: ".sf-section3",
                end: "bottom bottom",
                scrub: 1.2,
                invalidateOnRefresh: true,
            },
        });

        scrollTl.to(groupRef.current.rotation, {
            x: 0, y: "-=" + (Math.PI * 1.9), z: 0, ease: "linear", duration: 1
        }, 0);
        scrollTl.to(groupRef.current.position, { y: 0, ease: "power3.inOut", duration: 1 }, 0);
        scrollTl.to(groupRef.current.rotation, {
            x: -0.1, y: "+=" + (Math.PI * 2.2), z: 0.2, ease: "power2.inOut", duration: 1
        }, 1);
        scrollTl.to(groupRef.current.position, { ease: "power2.inOut", duration: 1 }, 1);

    }, { dependencies: [restScale, entranceDelay] });

    return (
        <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.4}>
            <group ref={groupRef} rotation={[0, -0.5, -0.4]}>
                <PhoneMesh>{children}</PhoneMesh>
            </group>
        </Float>
    );
}

function PhoneScene({ children, cameraZ = 5.6 }) {
    return (
        <Canvas camera={{ position: [0, 0, cameraZ], fov: 30 }} dpr={[1, 2]} gl={{ antialias: true }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[2, 3, 4]} intensity={1.1} />
            <directionalLight position={[-3, -1, -2]} intensity={0.25} color="#88aaff" />
            <Suspense fallback={null}>
                <PhoneModel>{children}</PhoneModel>
                <Environment preset="city" />
            </Suspense>
            <ContactShadows position={[0, -1.9, 0]} opacity={0.35} blur={2.4} far={2} />
        </Canvas>
    );
}


function MobilePhoneShowcase() {
    const sectionRef = useRef(null);
    const screensRef = useRef([]);

    useGSAP(() => {
        const screens = screensRef.current;
        if (screens.length < 3) return;

        gsap.set(screens, { opacity: 0 });
        gsap.set(screens[0], { opacity: 1 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "+=180%",
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            },
        });

        // Hold 1 (0–30%) → crossfade (30–40%) → Hold 2 (40–65%) → crossfade (65–75%) → Hold 3 (75–100%)
        tl.to(screens[0], { opacity: 0, duration: 0.10 }, 0.30)
            .to(screens[1], { opacity: 1, duration: 0.10 }, 0.30)
            .to(screens[1], { opacity: 0, duration: 0.10 }, 0.65)
            .to(screens[2], { opacity: 1, duration: 0.10 }, 0.65)
            .to(screens[2], { opacity: 1, duration: 0.001 }, 1); // anchor: forces tl.duration() === 1

        // Match the pattern used elsewhere in this codebase (DraggableSection):
        // recalculate pin geometry once images have actually loaded.
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);
        return () => window.removeEventListener("load", onLoad);
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="sf-mobile-phone-section">
            <div className="sf-mobile-phone-frame">
                <span className="sf-mobile-phone-btn sf-mobile-phone-btn-power" />
                <span className="sf-mobile-phone-btn sf-mobile-phone-btn-volume-up" />
                <span className="sf-mobile-phone-btn sf-mobile-phone-btn-volume-down" />

                <div className="sf-mobile-phone-screen-stack ">
                    <img
                        ref={(el) => (screensRef.current[0] = el)}
                        src="images/screen_logo.png"
                        alt="Sunflower screen 1"
                        className="sf-mobile-phone-screen"
                        onError={(e) => console.error("[MobilePhoneShowcase] failed to load", e.target.src)}
                    />
                    <img
                        ref={(el) => (screensRef.current[1] = el)}
                        src="images/screen_charts.png"
                        alt="Sunflower screen 2"
                        className="sf-mobile-phone-screen"
                        onError={(e) => console.error("[MobilePhoneShowcase] failed to load", e.target.src)}
                    />
                    <img
                        ref={(el) => (screensRef.current[2] = el)}
                        src="images/screen_chart.png"
                        alt="Sunflower screen 3"
                        className="sf-mobile-phone-screen"
                        onError={(e) => console.error("[MobilePhoneShowcase] failed to load", e.target.src)}
                    />
                </div>
            </div>
        </section>
    );
}


// ────────────────────────────────────────────────────────────────────────
// Phone screen contents (plain HTML/CSS, placed into 3D space via <Html>)
// ────────────────────────────────────────────────────────────────────────

function Screen1() {
    return (
        <div className="sf-screen">
            <img
                src="images/screen_logo.png"
                alt="Sunflower data screen 1"
            />
        </div>
    );
}

function Screen2() {
    return (
        <div className="sf-screen">
            <img
                src="images/screen_charts.png"
                alt="Sunflower data screen 2"
            />
        </div>
    );
}

function Screen3() {
    return (
        <div className="sf-screen">
            <img
                src="images/screen_chart.png"
                alt="Sunflower data screen 3"
            />
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Small icon glyphs (generic, no third-party brand marks)
// ────────────────────────────────────────────────────────────────────────

function QrIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <line x1="14" y1="14" x2="14" y2="21" />
            <line x1="21" y1="14" x2="21" y2="21" />
            <line x1="17.5" y1="14" x2="17.5" y2="17.5" />
        </svg>
    );
}
function DownloadIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M4 20h16" />
        </svg>
    );
}
function GridIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}
function ArrowDownIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="4" x2="12" y2="20" />
            <path d="M6 14l6 6 6-6" />
        </svg>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────

export default function SunflowerHero() {
    const container = useRef(null);
    const phoneStageRef = useRef(null);
    const [activeScreen, setActiveScreen] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 981px)");
        const update = () => setIsDesktop(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    useGSAP(
        () => {
            // 1. ANIMAZIONE DI INGRESSO (Intro testuale iniziale)
            gsap
                .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
                .from(".sf-hero h1", { y: 30 }, "-=0.6")
                .from(".sf-hero .sf-sub", { y: 16 }, "-=0.6")
                .from(".sf-hero-actions", { y: 14 }, "-=0.5")
                .from(".sf-note", {}, "-=0.4")
                .from(".sf-hero .sf-float-card", { y: 16, duration: 0.8 }, "-=0.6")
                .from(
                    ".sf-section2 .sf-eyebrow, .sf-section2 h2, .sf-section2 .sf-sub, .sf-section2-controls",
                    { y: 20, stagger: 0.12, duration: 0.8 },
                    "-=0.3"
                );

            if (!isDesktop || !phoneStageRef.current) return;

            gsap.set(phoneStageRef.current, { x: 0 });

            // 2. TIMELINE MASTER DI SCROLL (Legata alle prime 3 sezioni)
            const stageTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".sf-hero",
                    start: "top top",
                    endTrigger: ".sf-section3",
                    end: "bottom bottom",
                    scrub: 1,
                    invalidateOnRefresh: true,
                },
            });

            // STEP 2
            stageTl.to(phoneStageRef.current, {
                x: () => window.innerWidth * 0.27,
                ease: "power3.out",
                duration: 1
            }, 0);

            // STEP 3
            stageTl.to(phoneStageRef.current, {
                x: () => window.innerWidth * -0.25, // Muove il blocco sul lato sinistro
                ease: "power3.inOut",
                duration: 1
            }, 1);

            // STEP 4: AGGIUNGERE QUESTO BLOCCO FINALE
            // Quando lo scroll si sposta dall'80% al 100% della Sezione 3, 
            // il telefono viene sparato verso l'alto simulando l'ancoraggio alla sezione.
            gsap.to(".sf-phone-viewport", {
                y: () => -window.innerHeight, // Sale esattamente della stessa altezza dello schermo
                ease: "none",                 // Sincronia perfetta pixel per pixel
                scrollTrigger: {
                    trigger: ".sf-section3",
                    start: "bottom bottom",   // Parte ESATTAMENTE quando la sezione 3 comincia a salire
                    end: "bottom top",        // Finisce quando la sezione 3 è uscita completamente dallo schermo
                    scrub: true,              // Agganciato rigidamente allo scroll
                    invalidateOnRefresh: true
                }
            });

            // Cambio schermata reattivo
            const screenSwap = ScrollTrigger.create({
                trigger: ".sf-hero",
                start: "top top",
                endTrigger: ".sf-section3",
                end: "bottom bottom",
                onUpdate: (self) => {
                    const progress = self.progress;
                    if (progress < 0.35) {
                        setActiveScreen(0); // HeroScreen
                    } else if (progress >= 0.35 && progress < 0.75) {
                        setActiveScreen(1); // LensScreen (Sezione 2)
                    } else {
                        setActiveScreen(2); // ThirdScreen (Sezione 3)
                    }
                }
            });

            requestAnimationFrame(() => ScrollTrigger.refresh());
            return () => screenSwap.kill();
        },
        { scope: container, dependencies: [isDesktop] }
    );


    return (
        <div ref={container}>
            <div className="sf-glow sf-glow-hero" />

            {/* ================= HERO ================= */}
            <section className="sf-hero">
                <div className="sf-hero-inner">
                    <div>
                        <h1>
                            Turn Toward <br /> the <span className="elegant-text">Light</span>
                        </h1>
                    </div>
                    <div>
                        <p className="sf-sub">
                            Sunflower turns Data into Understanding, from mere Information to Knowledge with engaging visualizations and complementary educational tools.
                        </p>
                        <div className="sf-hero-actions">
                            <button className="sf-btn sf-btn-light">Start for free</button>
                            <button className="sf-icon-btn" aria-label="Scan QR code">
                                <QrIcon />
                            </button>
                            <button className="sf-icon-btn" aria-label="Download">
                                <DownloadIcon />
                            </button>
                        </div>
                        <div className="sf-note">* No account required to browse</div>
                    </div>
                </div>

                <div className="sf-float-card">
                    <b>7,900+</b>
                    <span>municipalities mapped, updated as new editions land</span>
                </div>
            </section>

            {/* ================= SECTION 2 ================= */}
            <section className="sf-section2">
                <div className="sf-section2-inner">
                    <h2>
                        See Past the Headlines.
                    </h2>
                    <p className="sf-sub">
                        Sunflower filters out the noise and shows you the dataset behind every headline — pick your lenses and
                        check the numbers yourself, in one tap.
                    </p>
                    <div className="sf-section2-controls">
                        <button className="sf-icon-btn" aria-label="View all lenses">
                            <GridIcon />
                        </button>
                        <button className="sf-icon-btn" aria-label="Scroll down">
                            <ArrowDownIcon />
                        </button>
                    </div>
                </div>
            </section>

            {/* ============== SECTION MOBILE =============== */}
            {!isDesktop && <MobilePhoneShowcase />}

            {/* ================= SECTION 3 ================= */}
            <section className="sf-section3">
                <div className="sf-section3-inner">
                    <h2>
                        Get to know <br /> the World
                    </h2>
                    <p className="sf-sub">
                        Compare data over years or drill straight down into specific neighborhood metrics.
                        All calculations adapt dynamically to keep the final comparison honest.
                    </p>
                    <div className="sf-section3-controls">
                        <button className="sf-btn sf-btn-light">Explore Data</button>
                    </div>
                </div>
            </section>




            {/* ================= THE PHONE ================= */}
            {/* Passata la prop activeScreen corretta e rimosso l'attributo ref={container} duplicato per evitare conflitti DOM */}
            {isDesktop && (
                <div className="sf-phone-viewport">
                    <div className="sf-phone-stage border-test" ref={phoneStageRef}>
                        <PhoneScene cameraZ={5.2}>
                            {activeScreen === 0 && <Screen1 />}
                            {activeScreen === 1 && <Screen2 />}
                            {activeScreen === 2 && <Screen3 />}
                        </PhoneScene>
                    </div>
                </div>
            )}
        </div>
    );

}