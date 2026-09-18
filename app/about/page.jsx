"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import "../../styles/about.css";
import "../../styles/fonts.css";
import StaticMenu from "../../components/StaticMenu"

// Registrazione del plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

function ArrowDownIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 4V20M12 20L6 14M12 20L18 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function Manifesto() {
    const containerRef = useRef(null);

    // Dati del Manifesto di Sunflower
    const introHeadline = "Flowers that turn toward the light";
    const introParagraphs = [
        "A sunflower doesn't wait to be told which way the sun is. It just turns — heliotropism, orienting itself toward the one source that actually sustains it.",
        "We named this app after that instinct, because it's the instinct that's gone missing from how people meet information today.",
    ];

    const problemHeadline = "The problem is not lack of information.";
    const problemParagraphs = [
        "We are the most informed generation in history, and one of the most confused. We scroll, react, and by tomorrow it's gone.",
        "Democracies need a shared set of facts to argue from. When everyone's 'facts' are individually curated, that shared floor erodes."
    ];

    const features = [
        {
            title: "We give everyone the same source.",
            text: "Not a version of the truth optimized for your profile — the same verified, checkable information, whoever you are. AI here is a tool for retrieval and clarity, never the origin of the fact itself.",
            image: "images/source_data.jpg"
        },
        {
            title: "We help information become knowledge.",
            text: "Reading a fact isn't understanding it. Sunflower borrows from the science of learning — spaced repetition, active recall — so what you read actually sticks. Fewer things, held better.",
            image: "images/stick.jpg"
        },
        {
            title: "We teach by asking, not just telling.",
            text: "Socrates never handed students conclusions — he asked. Sunflower does the same: why does this matter, what does it connect to. Knowledge you build yourself sits differently than knowledge you're just told.",
            image: "images/socrates.jpg"
        },
        {
            title: "We unlock data that was public but never usable.",
            text: "Government spending, climate data, health stats — technically open, practically unreadable, trapped in spreadsheets built for analysts. Sunflower turns tables into shapes a person can actually see.",
            image: "images/door.jpg"
        },
        {
            title: "We treat your data as belonging to you.",
            text: "No profile built to sell to advertisers. Your data shows you to you — what you know, where the gaps are. That's the whole point, not a checkbox.",
            image: "images/mirror.jpg"
        },
        {
            title: "We rebuild the room.",
            text: "Understanding alone, in a personalized bubble, is still a bubble. Sunflower is built for comparing understanding with others — and a door to real journalists and researchers doing the original work.",
            image: "images/room.jpg"
        }
    ];

    const crisisTitle = "Why now";
    const crisisPoints = [
        { label: "An ecological crisis", text: "that needs fast public understanding — slowed by misinformation and the noise of competing 'facts.'" },
        { label: "A privacy crisis", text: ", where the tools meant to help you understand the world are quietly built to extract from you instead." },
        { label: "A democratic crisis", text: ", where the shared factual floor a society needs is eroding into millions of individually tailored realities." }
    ];
    const crisisConclusion = "Sunflower is a bet that these three share a root: people have lost direct access to how the world actually is. Give that back, and something starts to heal upstream of all three.";

    const outroTitle = "Sunflower";
    const outroParagraphs = [
        "A sunflower faces the sun because that's what it's built to do — not because someone stands behind it, turning its head.",
        "We'd like to build people the same kind of instrument. Not a filter. Not an oracle. A way of turning, on your own, toward what's real."
    ];

    // Unione di tutte le sezioni in un unico array strutturato
    const panelsData = [
        { type: 'text-hero', title: introHeadline, content: introParagraphs, image: 'images/sunflower_in.jpg' },
        { type: 'text-hero', title: problemHeadline, content: problemParagraphs, image: 'images/overload.jpg' },
        ...features.map(f => ({ type: 'feature', title: f.title, content: [f.text], image: f.image })),
        { type: 'crisis', title: crisisTitle, content: crisisPoints, extraText: crisisConclusion, image: 'images/eco.png' },
        { type: 'text-hero', title: outroTitle, content: outroParagraphs, image: 'images/sunflower_out.jpg' }
    ];

    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            const panels = gsap.utils.toArray < HTMLElement > (".sf-panel");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: `+=${panels.length * 100}%`,
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                },
            });

            panels.forEach((panel, i) => {
                const imgContainer = panel.querySelector(".sf-image-wrap");
                const textElements = panel.querySelectorAll(".sf-animate-text");

                if (i > 0) {
                    gsap.set(panel, {
                        opacity: 0,
                        pointerEvents: "none",
                    });

                    gsap.set(imgContainer, {
                        xPercent: i % 2 === 0 ? -30 : 30,
                        scale: 0.85,
                    });

                    gsap.set(textElements, {
                        y: 40,
                        opacity: 0,
                    });
                }

                if (i > 0) {
                    tl.to(
                        panel,
                        {
                            opacity: 1,
                            pointerEvents: "all",
                            duration: 0.5,
                        },
                        i - 0.2
                    )
                        .to(
                            imgContainer,
                            {
                                xPercent: 0,
                                scale: 1,
                                duration: 0.6,
                                ease: "power2.out",
                            },
                            i - 0.2
                        )
                        .to(
                            textElements,
                            {
                                y: 0,
                                opacity: 1,
                                stagger: 0.1,
                                duration: 0.5,
                            },
                            i - 0.1
                        );
                }

                if (i < panels.length - 1) {
                    tl.to(
                        imgContainer,
                        {
                            xPercent: i % 2 === 0 ? 30 : -30,
                            scale: 0.85,
                            opacity: 0,
                            duration: 0.6,
                            ease: "power2.in",
                        },
                        i + 0.6
                    )
                        .to(
                            textElements,
                            {
                                y: -40,
                                opacity: 0,
                                stagger: 0.05,
                                duration: 0.5,
                            },
                            i + 0.6
                        )
                        .to(
                            panel,
                            {
                                opacity: 0,
                                pointerEvents: "none",
                                duration: 0.4,
                            },
                            i + 0.8
                        );
                }
            });

            tl.fromTo(
                ".sf-progress-bar",
                { width: "0%" },
                {
                    width: "100%",
                    ease: "none",
                    duration: tl.duration(),
                },
                0
            );
        });

        return () => {
            mm.revert();
        };
    }, { scope: containerRef });

    return (
        <div className="sf-page">
            <StaticMenu />
            {/* ================= MANIFESTO HERO ================= */}
            <div className="sf-glow sf-glow-hero" />

            <section className="sf-hero sf-hero-manifesto">
                <div className="sf-hero-manifesto-inner">
                    <span className="sf-eyebrow">The Sunflower Manifesto</span>

                    <h2>
                        Nothing turns you <br />
                        except <span className="elegant-text">what's real</span>
                    </h2>

                    <p className="sf-sub">
                        Why we built Sunflower, what we think is broken about how people
                        meet information today, and the bet we're making to fix it.
                    </p>

                    <div className="sf-hero-actions">
                        <button className="sf-btn sf-btn-light">Start reading</button>
                        <button className="sf-icon-btn" aria-label="Scroll down">
                            <ArrowDownIcon />
                        </button>
                    </div>

                    <div className="sf-note">* Takes about 4 minutes to scroll through</div>
                </div>
            </section>

            <div ref={containerRef} className="sf-container">
                {/* Barra di progresso fissa in alto */}
                <div className="sf-progress-track">
                    <div className="sf-progress-bar" />
                </div>

                {/* Contenitore principale bloccato da GSAP */}
                {panelsData.map((panel, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <div
                            key={index}
                            className={`sf-panel ${isEven ? 'sf-layout-standard' : 'sf-layout-reverse'}`}
                        >
                            <div className="sf-image-wrap">
                                <img
                                    src={panel.image}
                                    alt={`Visual element for section ${index + 1}`}
                                />
                            </div>

                            <div className="sf-text-wrap">
                                <h3 className="sf-animate-text">{panel.title}</h3>

                                {panel.type !== 'crisis' ? (
                                    panel.content.map((p, pIdx) => (
                                        <p key={pIdx} className="sf-animate-text">
                                            {p}
                                        </p>
                                    ))
                                ) : (
                                    <>
                                        {panel.content.map((point, ptIdx) => (
                                            <div key={ptIdx} className="sf-animate-text sf-crisis-point">
                                                <span>{point.label}</span>
                                                <span>{point.text}</span>
                                            </div>
                                        ))}
                                        <p className="sf-animate-text sf-crisis-conclusion">
                                            {panel.extraText}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}