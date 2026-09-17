"use client";
import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ================= SOTTO-COMPONENTE PER LE PAROLE (STAGGER NATIVO) =================
// Identico a DraggableSection, ma con classi CSS reali al posto delle utility
// Tailwind arbitrarie che il content-scanner non stava raccogliendo.
function StaggeredWord({ text, active, delay }) {
    const wordRef = useRef(null);
    const prevActive = useRef(false);

    useGSAP(() => {
        if (!wordRef.current) return;

        if (active) {
            gsap.set(wordRef.current, { y: 24, opacity: 0 });
            gsap.to(wordRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.85,
                delay: delay / 1000,
                ease: "power3.out",
            });
        } else if (prevActive.current) {
            gsap.to(wordRef.current, {
                y: -16,
                opacity: 0,
                duration: 0.3,
                delay: delay / 1000,
                ease: "power3.in",
            });
        }
        prevActive.current = active;
    }, [active, delay]);

    return (
        <span className="sf-word-mask">
            <span ref={wordRef} className="sf-word-inner">
                {text}
            </span>
        </span>
    );
}

// ================= ICONS =================
function SearchIcon() {
    return (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <line x1="15.5" y1="15.5" x2="21" y2="21" />
            <path d="M9 10.5h3M10.5 9v3" />
        </svg>
    );
}

function ChartAutoIcon() {
    return (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20V10" />
            <path d="M10 20V4" />
            <path d="M16 20v-7" />
            <path d="M20 20V13" />
            <path d="M2 20h20" />
        </svg>
    );
}

function ContextIcon() {
    return (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="13" y2="13" />
        </svg>
    );
}

function GamifiedIcon() {
    return (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6H6z" />
            <path d="M9 12v3a3 3 0 0 0 6 0v-3" />
            <path d="M3 6h3v3a3 3 0 0 1-3 3z" />
            <path d="M21 6h-3v3a3 3 0 0 0 3 3z" />
            <line x1="12" y1="18" x2="12" y2="21" />
            <line x1="9" y1="21" x2="15" y2="21" />
        </svg>
    );
}

const FEATURES = [
    {
        icon: SearchIcon,
        title: "Semantic search across public datasets",
        text: "No technical query skills needed — ask in plain language and Sunflower finds the dataset that answers it.",
    },
    {
        icon: ChartAutoIcon,
        title: "Instant visualization",
        text: "Interactive charts, automatically generated the moment you find the data — no spreadsheet setup, ever.",
    },
    {
        icon: ContextIcon,
        title: "Contextual explanations on every chart",
        text: "Every visualization comes with the context it needs, preventing the kind of misreading that spreads misinformation.",
    },
    {
        icon: GamifiedIcon,
        title: "Gamified learning",
        text: "Built on literacy-education best practices, so what you learn about your world actually sticks.",
    },
];

const DEFAULT_TITLE = "From opaque tables to insight in a few taps";

// ================= COMPONENTE PRINCIPALE =================
export default function HowItWorksSection({
    title = DEFAULT_TITLE,
    features = FEATURES,
    staggerDelay = 35
}) {
    const sectionRef = useRef(null);

    const [isTextActive, setIsTextActive] = useState(false);
    const [itemsActive, setItemsActive] = useState(false);

    const wordsArray = title.split(" ");

    useGSAP(() => {
        const st = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top 80%",

            onEnter: () => gsap.delayedCall(0.5, () => {
                setIsTextActive(true);
                setItemsActive(true);
            }),

            onEnterBack: () => gsap.delayedCall(0.5, () => {
                setIsTextActive(true);
                setItemsActive(true);
            }),

            onLeave: () => {
                setIsTextActive(false);
                setItemsActive(false);
            },

            onLeaveBack: () => {
                setIsTextActive(false);
                setItemsActive(false);
            },
            invalidateOnRefresh: true,
        });

        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);

        return () => {
            st.kill();
            window.removeEventListener("load", onLoad);
        };
    }, { scope: sectionRef });

    // Separate effect for the four feature items, mirroring how DraggableSection
    // animates its cards once cardsActive flips true.
    useGSAP(() => {
        const items = sectionRef.current.querySelectorAll(".sf-howitworks-item");
        if (!items.length) return;

        if (!itemsActive) {
            gsap.set(items, { opacity: 0, y: 40 });
            return;
        }

        gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.4,
        });
    }, { scope: sectionRef, dependencies: [itemsActive] });

    return (
        <section id="features" ref={sectionRef} className="sf-howitworks-section">
            <div className="sf-glow sf-glow-section2" />

            <div className="sf-howitworks-content">
                <h2 className="sf-howitworks-title">
                    {wordsArray.map((word, idx) => (
                        <StaggeredWord
                            key={idx}
                            text={word}
                            active={isTextActive}
                            delay={idx * staggerDelay}
                        />
                    ))}
                </h2>

                <div className="sf-howitworks-grid">
                    {features.map(({ icon: Icon, title: itemTitle, text }, idx) => (
                        <div key={idx} className="sf-howitworks-item">
                            <div className="sf-howitworks-icon">
                                <Icon />
                            </div>
                            <h4 className="sf-howitworks-item-title">{itemTitle}</h4>
                            <p className="sf-howitworks-item-text">{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}