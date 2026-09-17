"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function FlowerGlyph() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6" strokeLinecap="round" />
        </svg>
    );
}

export default function StaticMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const overlayRef = useRef(null);

    useGSAP(() => {
        if (!isOpen || !overlayRef.current) return;
        gsap.fromTo(
            overlayRef.current,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }, { dependencies: [isOpen] });

    return (
        <>
            <div className="sf-about-nav">
                <Link href="/" className="sf-about-nav-logo" aria-label="Back to home">
                    <FlowerGlyph />
                </Link>
                <button
                    className="sf-about-nav-toggle"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open menu"
                >
                    Menu
                </button>
            </div>

            {isOpen && (
                <div ref={overlayRef} className="sf-about-nav-overlay">
                    <button
                        className="sf-overlay-close-circle sf-about-nav-close"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <nav className="sf-overlay-nav">
                        <Link href="/">Home</Link>
                        <Link href="/#features">Features</Link>
                        <Link href="/#pricing">Pricing</Link>
                        <Link href="/about">Manifesto</Link>
                    </nav>
                </div>
            )}
        </>
    );
}