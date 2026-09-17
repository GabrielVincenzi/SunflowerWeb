"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FAQ_DATA = [
    {
        question: "Is Sunflower free?",
        answer: "Yes. Browsing the data, the charts, and the core learning tools is free — no account required. We believe the same facts should be reachable by everyone, not just people who can pay."
    },
    {
        question: "Where does the data come from?",
        answer: "Verified sources only: Eurostat, ISTAT, municipal and government records, and independent data journalists and think tanks. Every chart traces back to a public, checkable source — nothing is generated or guessed."
    },
    {
        question: "Why charts instead of raw datasets?",
        answer: "Because open data that nobody can read isn't really open. Sunflower turns public tables and files into visuals anyone can understand in seconds — no spreadsheet skills required."
    }
];

export default function SfFaqSection() {
    const containerRef = useRef(null);

    useGSAP(() => {
        // Timeline d'ingresso per i testi della colonna sinistra e i blocchi FAQ a destra
        gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%", // Parte quando la sezione entra visibilmente nel viewport
                toggleActions: "play none none reverse"
            }
        })
            .fromTo(".sf-faq-left-content > *",
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.12,
                    ease: "power3.out"
                }
            )
            .fromTo(".sf-faq-item",
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.15, // Crea l'effetto cascata dall'alto verso il basso
                    ease: "power3.out"
                },
                "-=0.5" // Inizia leggermente prima che la colonna sinistra abbia finito
            );

    }, { scope: containerRef });

    return (
        <section id="faqs" ref={containerRef} className="sf-faq-section ">
            <div className="sf-faq-container">

                {/* COLONNA SINISTRA: Titolo e Pulsanti stabili */}
                <div className="sf-faq-left-column">
                    <div className="sf-faq-left-content">
                        <p className="sf-faq-lead-text">
                            Questions before you turn toward the light? Here are the ones we hear most.
                            Still curious? <a href="#help" className="sf-faq-link">Reach out — we're here to help.</a>
                        </p>

                        <div className="sf-faq-actions">
                            <button className="sf-faq-btn-primary">Start for free</button>
                            <button className="sf-faq-btn-icon">
                                {/* Icona Grid */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                                </svg>
                            </button>
                            <button className="sf-faq-btn-icon">
                                {/* Icona Freccia Giù */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M12 5v14M19 12l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLONNA DESTRA: Lista Domande e Risposte */}
                <div className="sf-faq-right-column">
                    {FAQ_DATA.map((item, index) => (
                        <div key={index} className="sf-faq-item">
                            <h4 className="sf-faq-question">{item.question}</h4>
                            <p className="sf-faq-answer">{item.answer}</p>
                            <div className="sf-faq-divider"></div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}