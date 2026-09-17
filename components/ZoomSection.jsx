"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SfZoomSection() {
    const sectionRef = useRef(null);
    const placeholderRef = useRef(null);
    const actualPillRef = useRef(null);

    useGSAP(() => {
        const placeholder = placeholderRef.current;
        const actualPill = actualPillRef.current;
        const section = sectionRef.current;

        if (!placeholder || !actualPill || !section) return;

        const mm = gsap.matchMedia();

        mm.add("(min-width: 981px)", () => {
            const rectPlaceholder = placeholder.getBoundingClientRect();
            const rectSection = section.getBoundingClientRect();
            const placeholderCenterX = rectPlaceholder.left - rectSection.left + rectPlaceholder.width / 2;
            const placeholderCenterY = rectPlaceholder.top - rectSection.top + rectPlaceholder.height / 2;

            gsap.set(actualPill, {
                transformOrigin: `${(placeholderCenterX / window.innerWidth) * 104}% ${(placeholderCenterY / window.innerHeight) * 98}%`,
            });

            const startScaleX = rectPlaceholder.width / window.innerWidth;
            const startScaleY = rectPlaceholder.height / window.innerHeight;
            gsap.set(actualPill, { scaleX: startScaleX, scaleY: startScaleY, borderRadius: "38px" });


            const tl = gsap.timeline({
                scrollTrigger: { trigger: section, start: "top top", end: "+=130%", pin: true, scrub: 1 },
            })
                .to(".sf-zoom-title-text", { filter: "blur(20px)", opacity: 0.1, scale: 1.2, duration: 1, ease: "power1.inOut" }, 0)
                .to(actualPill, { scaleX: 1, scaleY: 1, borderRadius: "0px", duration: 1, ease: "power1.inOut" }, 0);

            return () => tl.kill();
        });

        mm.add("(max-width: 980px)", () => {
            // Strip any leftover inline transform/scale so CSS below takes over cleanly
            gsap.set(actualPill, { clearProps: "all" });
            gsap.set(".sf-zoom-title-text", { clearProps: "all" });

            const fadeIn = gsap.from(".sf-zoom-title-text", {
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: { trigger: section, start: "top 75%", toggleActions: "play none none reverse" },
            });

            return () => fadeIn.scrollTrigger?.kill();
        });

        return () => mm.revert();
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="sf-zoom-section" style={{ position: 'relative' }}>
            <h3 className="sf-zoom-title-text">
                Knowledge <span ref={placeholderRef} className="sf-pill-placeholder border-test"></span> in <br />
                Plain Sight
            </h3>

            <div ref={actualPillRef} className="sf-image-pill-wrapper">
                <img
                    src="/images/sight.jpg"
                    alt="Watch application"
                    className="sf-pill-raw-img"
                />
            </div>
        </section>
    );
}
