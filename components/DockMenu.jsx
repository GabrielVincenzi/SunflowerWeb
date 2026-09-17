"use client";
import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function DockMenu() {
    const dockRef = useRef(null);
    const overlayRef = useRef(null);

    // stati: "standard", "collapsed", "open"
    const [dockState, setDockState] = useState("collapsed");

    // 2. NUOVO: Forza lo stile css iniziale a collassato per evitare flash visivi
    useGSAP(() => {
        if (!dockRef.current) return;

        // Imposta istantaneamente le dimensioni del collapsed prima di mostrare il componente
        gsap.set(dockRef.current, {
            width: "56px",
            height: "56px",
            borderRadius: "100px",
            backgroundColor: "rgba(244, 241, 233, 0.95)"
        });
        gsap.set(".sf-dock-hide-on-collapse", { opacity: 0, display: "none" });

        // Timer di 1 secondo prima di espandersi a "standard"
        const introTimeout = setTimeout(() => {
            // Controlla che l'utente non sia già sceso con lo scroll e che il menu non sia stato aperto
            const isPastHero = window.scrollY > window.innerHeight * 0.2;

            if (!isPastHero && dockState !== "open") {
                setDockState("standard");
                animateToStandard();
            }
        }, 2600);

        return () => clearTimeout(introTimeout);
    }, { dependencies: [] }); // Eseguito solo una volta al mount

    // 3. SCROLL TRIGGER
    useGSAP(() => {
        if (!dockRef.current) return;

        ScrollTrigger.create({
            trigger: ".sf-hero",
            start: "top top",
            end: "bottom 80%",
            scrub: 0.5,
            onLeave: () => {
                if (dockState !== "open") {
                    setDockState("collapsed");
                    animateToCollapsed();
                }
            },
            onEnterBack: () => {
                if (dockState !== "open") {
                    setDockState("standard");
                    animateToStandard();
                }
            }
        });
    }, { dependencies: [dockState] });

    // --- FUNZIONI DI MORPHING ---

    const animateToStandard = () => {
        gsap.to(dockRef.current, {
            width: "380px",
            height: "56px",
            borderRadius: "100px",
            backgroundColor: "rgba(244, 241, 233, 0.9)",
            duration: 1,
            ease: "back.out(1.2)"
        });
        gsap.to(".sf-dock-hide-on-collapse", { opacity: 1, display: "flex", duration: 0.2 });
    };

    const animateToCollapsed = () => {
        gsap.to(dockRef.current, {
            width: "56px",
            height: "56px",
            borderRadius: "100px",
            backgroundColor: "rgba(244, 241, 233, 0.95)",
            duration: 1,
            ease: "power2.out"
        });
        gsap.to(".sf-dock-hide-on-collapse", { opacity: 0, display: "none", duration: 0.1 });
    };

    const handleDockClick = () => {
        if (dockState === "standard" || dockState === "collapsed") {
            setDockState("open");

            const openTl = gsap.timeline();
            openTl.to(dockRef.current, {
                width: "440px",
                height: "500px",
                borderRadius: "32px",
                backgroundColor: "rgba(244, 241, 233, 0.98)",
                boxShadow: "0px 20px 40px rgba(0,0,0,0.25)",
                bottom: "16%", // Alzato leggermente per fare spazio al bottone di chiusura sotto
                duration: 1.6,
                ease: "power4.out"
            });
            openTl.fromTo(overlayRef.current,
                { opacity: 0, y: 5 },
                { opacity: 1, y: 0, duration: 1.4, ease: "power2.out" },
                "-=0.2"
            );
            // Animazione d'ingresso del pulsante di chiusura esterno
            openTl.fromTo(".sf-overlay-close-circle",
                { opacity: 0, scale: 0.6 },
                { opacity: 1, scale: 1, duration: 1.6, ease: "back.out(1.6)" },
                "-=0.2"
            );
        }
    };

    const handleClose = (e) => {
        e.stopPropagation(); // Previene il bubbling che riaprirebbe il menu

        const isPastHero = window.scrollY > window.innerHeight * 0.2;
        const targetState = isPastHero ? "collapsed" : "standard";

        const closeTl = gsap.timeline({
            onComplete: () => {
                // Aggiorna lo stato React solo alla fine dell'animazione geometrica
                setDockState(targetState);
            }
        });

        // 1. SVUOTA IL PANNELLO: Fa sparire istantaneamente il testo interno e la X di chiusura
        closeTl.to([overlayRef.current, ".sf-overlay-close-circle"], {
            opacity: 0,
            y: -10,
            duration: 0.2,
            ease: "power2.in"
        });

        // 2. MORPHING GEOMETRICO: Quando dentro è vuoto, rimpicciolisce la scocca esterna
        closeTl.to(dockRef.current, {
            width: targetState === "collapsed" ? "56px" : "380px",
            height: "56px",
            borderRadius: targetState === "collapsed" ? "50%" : "100px",
            backgroundColor: "rgba(244, 241, 233, 0.9)",
            boxShadow: "0px 0px 0px rgba(0,0,0,0)",
            bottom: "2rem",
            duration: 0.4,
            ease: "power3.inOut"
        });

        // 3. APPARIZIONE FINALE: Solo se torna allo stato standard, fa apparire logo, hamburger e download
        if (targetState === "standard") {
            closeTl.fromTo(".sf-dock-hide-on-collapse, .sf-dock-center-logo",
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, display: "flex", duration: 0.6, ease: "power1.out" }
            );
        }
    };


    return (
        <>
            <div
                ref={dockRef}
                className={`sf-dock-container is-${dockState}`}
                onClick={handleDockClick}
            >
                {/* INTERFACCIA CHIUSA (Stati Standard e Collapsed) */}
                {(dockState === "standard" || dockState === "collapsed") && (
                    <div className="sf-dock-closed-layout">
                        {/* Posizionato in modo assoluto a sinistra */}
                        <button className="sf-dock-icon-btn sf-dock-hide-on-collapse" aria-label="Menu">
                            <MenuIcon />
                        </button>

                        {/* Sempre rigidamente al centro dello schermo */}
                        <div className="sf-dock-center-logo">
                            <FlowerGlyph />
                        </div>

                        {/* Posizionato in modo assoluto a destra */}
                        <button className="sf-dock-download-pill sf-dock-hide-on-collapse">
                            <span>Download</span>
                        </button>
                    </div>
                )}

                {/* INTERFACCIA APERTA OVERLAY (Stato Open) */}
                {dockState === "open" && (
                    <div ref={overlayRef} className="sf-dock-open-overlay">
                        <div className="sf-overlay-header">
                            <nav className="sf-overlay-nav">
                                <a href="#home" onClick={handleClose}>Home</a>
                                <a href="#features" onClick={handleClose}>Features</a>
                                <a href="#faqs" onClick={handleClose}>Questions</a>
                                <a href="/about" onClick={handleClose}>About</a>
                            </nav>
                            <div className="sf-overlay-logo">
                                <FlowerGlyph />
                            </div>
                        </div>

                        <div className="sf-overlay-footer">
                            <div className="sf-footer-links">
                                <div className="sf-link-col">
                                    <a href="#support">Support</a>
                                    <a href="#terms">Terms of Use</a>
                                    <a href="#privacy">Policy Privacy</a>
                                </div>
                                <div className="sf-link-col">
                                    <a href="#linkedin">Linkedin</a>
                                    <a href="#instagram">Instagram</a>
                                </div>
                            </div>

                            <button className="sf-overlay-btn-dark">
                                Download
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* IL BOTTONE DI CHIUSURA ESTERNO (STILE FLOWTY) */}
            {dockState === "open" && (
                <button className="sf-overlay-close-circle" onClick={handleClose} aria-label="Close menu">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </>
    );
}


function MenuIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
    );
}

function FlowerGlyph() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6" strokeLinecap="round" />
        </svg>
    );
}
