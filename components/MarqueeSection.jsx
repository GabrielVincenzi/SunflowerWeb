"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function MarqueeSection() {
    const containerRef = useRef(null);
    const marqueeRef = useRef(null);

    useGSAP(() => {
        // 1. SCORRIMENTO ORIZZONTALE INFINITO (Loop continuo automatico)
        // Spostiamo il blocco del 50% verso sinistra (X) e resettiamo all'infinito
        const marqueeTween = gsap.to(marqueeRef.current, {
            xPercent: -50,
            ease: "none",
            duration: 40, // Velocità del loop (più basso = più veloce)
            repeat: -1
        });

        // 2. EFFETTO BLUR REATTIVO ALLO SCROLL
        // Il testo diventa progressivamente sfocato (blur) e trasparente man mano che si scende
        gsap.to(marqueeRef.current, {
            filter: "blur(12px)",
            opacity: 0.15,
            scale: 0.95, // Leggero rimpicciolimento per dare profondità 3D
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 60%",    // L'effetto blur inizia quando la sezione entra nel viewport
                end: "bottom 10%",   // Raggiunge il picco quando sta quasi per uscire
                scrub: 0.5,          // Sincronizzazione fluida con la rotella dello scroll
            }
        });

    }, { scope: containerRef });

    // Stringa ripetuta per garantire la copertura totale della larghezza dello schermo
    const marqueeText = "Questions? * Questions? * Questions? * Questions? * ";

    return (
        <section ref={containerRef} className="sf-marquee-section">
            <div className="sf-marquee-wrapper">
                <div ref={marqueeRef} className="sf-marquee-content">
                    {/* Duplichiamo il blocco di testo per creare l'illusione ottica del loop infinito */}
                    <span>{marqueeText}</span>
                    <span>{marqueeText}</span>
                </div>
            </div>
        </section>
    );
}
