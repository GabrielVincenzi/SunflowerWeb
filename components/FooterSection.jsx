"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Il tuo componente icona personalizzato adattato per il controllo CSS/GSAP
function FlowerGlyph() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sf-icon-svg">
            <path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6" strokeLinecap="round" />
        </svg>
    );
}

export default function FooterSection() {
    const containerRef = useRef(null);
    const ctaRef = useRef(null);
    const footerLinksRef = useRef(null);

    // Riferimenti per l'animazione ad incrocio
    const leftIconRef = useRef(null);
    const rightLogoRef = useRef(null);

    useGSAP(() => {
        // 1. EFFETTO REVEAL PARALLASSE (Rimane a scrub perché gestisce la transizione alta)
        gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
            }
        })
            .fromTo(ctaRef.current,
                { y: 0, opacity: 1 },
                { y: -40, opacity: 0.3, ease: "none" },
                0
            )
            .fromTo(footerLinksRef.current,
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, ease: "power2.out" },
                0
            );

        // 2. NUOVA ANIMAZIONE AUTOMATICA AD INGRESSO 
        // Si attiva da sola quando il footer entra nel mirino dello schermo
        gsap.timeline({
            scrollTrigger: {
                trigger: ".sf-actual-footer", // Si ancora all'inizio del footer vero e proprio
                start: "top 50%",            // Parte quando il footer emerge dal basso dell'85% del viewport
                toggleActions: "play none none reverse", // Play all'andata, Reverse se l'utente risale
            }
        })
            .fromTo(leftIconRef.current,
                { x: "-500px", y: "120px", rotation: -180 },
                {
                    x: "-100px",
                    y: "120px",
                    rotation: 0,
                    duration: 1.2,
                    ease: "power3.out"
                },
                0
            )
            .fromTo(rightLogoRef.current,
                { x: "500px", y: "120px" },
                {
                    x: "200px",
                    y: "120px",
                    duration: 1.2,
                    ease: "power3.out"
                },
                0
            );

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="sf-footer-container">

            {/* ================= SEZIONE CTA ================= */}
            <section ref={ctaRef} className="sf-cta-section">
                <h2 className="sf-cta-title">Try Sunflower Today!</h2>
                <p className="sf-cta-subtitle">
                    Take control over your timeflow <br />
                    and start <span className="sf-cta-underline">today for free.</span>
                </p>

                <div className="sf-store-buttons">
                    <button className="sf-btn-store">App Store</button>
                    <button className="sf-btn-store">Google Play</button>
                </div>
            </section>

            {/* ================= VERO FOOTER REVEAL ================= */}
            <footer className="sf-actual-footer">

                {/* Griglia Principale Link + QR Code */}
                <div ref={footerLinksRef} className="sf-footer-grid">
                    <div className="sf-footer-qr-block">
                        <div className="sf-qr-placeholder">
                            <div className="sf-qr-box"></div>
                        </div>
                        <div className="sf-qr-text">
                            <p>Scan this QR code <br />to download Sunflower.</p>
                            <a href="#zoom" className="sf-qr-link">Click to zoom</a>
                        </div>
                    </div>

                    <div className="sf-footer-links-column">
                        <h4>Home</h4>
                        <a href="#features">Features</a>
                        <a href="#referral">Questions</a>
                        <a href="#pricing">About</a>
                        <a href="#download">Download</a>
                    </div>

                    <div className="sf-footer-links-column">
                        <h4>Support</h4>
                        <a href="#terms">Terms of Use</a>
                        <a href="#privacy">Privacy Policy</a>
                    </div>

                    <div className="sf-footer-links-column">
                        <h4>Linkedin</h4>
                        <a href="#instagram">Instagram</a>
                    </div>
                </div>

                {/* Linea divisoria e Copyright */}
                <div className="sf-footer-bottom border-test">
                    <div className="sf-footer-divider"></div>
                    <div className="sf-footer-sub-bar">
                        <span>All rights reserved © 2026 by Sunflower.co</span>
                        <span>Designed by Moyra</span>
                    </div>

                    {/* Contenitore per l'animazione ad incrocio */}
                    <div className="sf-cross-animation-wrapper border-test">

                        {/* Icona FlowerGlyph (Esce da sinistra ruotando) */}
                        <div ref={leftIconRef} className="sf-cross-left-icon">
                            <FlowerGlyph />
                        </div>

                        {/* Logo testuale (Esce da destra verso sinistra) */}
                        <div ref={rightLogoRef} className="sf-cross-right-logo">
                            SunFlower
                        </div>

                    </div>
                </div>
            </footer>
        </div>
    );
}
