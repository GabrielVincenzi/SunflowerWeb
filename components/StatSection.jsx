"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function StatSection() {
    const sectionRef = useRef(null);
    const percentRef = useRef(null);

    useGSAP(() => {
        const counterObj = { value: 0 };
        const chartLines = sectionRef.current.querySelectorAll(".sf-chart-line");

        chartLines.forEach(line => {
            const length = line.getTotalLength();
            gsap.set(line, {
                strokeDasharray: length,
                strokeDashoffset: length
            });
        });

        const statsTl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 40%",
                end: "bottom 80%",
                scrub: 1,
            }
        });

        statsTl.to(counterObj, {
            value: 73,
            ease: "linear",
            onUpdate: () => {
                if (percentRef.current) {
                    percentRef.current.innerText = `Up To ${Math.floor(counterObj.value)}%`;
                }
            }
        }, 0);

        statsTl.to(chartLines, {
            strokeDashoffset: 0,
            ease: "power1.inOut",
            stagger: 0.4,
            duration: 1,
        }, 0);

    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="sf-stats-section">

            <div className="sf-charts-bg-container">
                <svg
                    viewBox="0 0 1000 400"
                    preserveAspectRatio="none"
                    className="sf-chart-svg"
                >
                    {/* Linea 1: curva principale, ascesa dolce da sinistra a destra */}
                    <path
                        className="sf-chart-line sf-line-1"
                        d="M 0 330 C 120 345, 200 310, 280 300 C 380 288, 420 260, 500 245 C 580 230, 640 190, 720 165 C 800 140, 860 95, 940 60 C 970 45, 985 35, 1000 25"
                    />

                    {/* Linea 2: curva secondaria, più ampia e leggera */}
                    <path
                        className="sf-chart-line sf-line-2"
                        d="M 0 365 C 130 380, 220 340, 300 335 C 400 328, 440 290, 520 270 C 600 250, 660 205, 740 170 C 820 135, 870 75, 950 30 C 975 15, 985 8, 1000 2"
                    />

                    {/* Linea 3: curva di sfondo, smorzata */}
                    <path
                        className="sf-chart-line sf-line-3"
                        d="M 0 312 C 140 316, 230 306, 310 308 C 410 310, 450 298, 530 292 C 610 286, 670 268, 750 250 C 830 232, 880 205, 960 175 C 980 167, 990 162, 1000 158"
                    />
                </svg>
            </div>

            <div className="sf-stats-content">
                <h2 ref={percentRef} className="sf-stat-number">Up To 0%</h2>
                <p className="sf-stat-description">
                    <span className="sf-underline-text">Find government statistics hard to understand</span> — and 77% say they're difficult to find.
                    Sunflower fixes both: data that used to take hours to track down is now surfaced in one search, clearly visualizations with contextual explanations so anyone
                    can make informed decisions.
                </p>
            </div>
        </section>
    );
}