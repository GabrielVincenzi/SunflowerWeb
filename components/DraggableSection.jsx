"use client";
import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ================= DATASET DI INPUT COPIATO DAL TUO DESIGN =================
const DEFAULT_REVIEWS = [
    {
        id: 1,
        name: "Organization for Economic Cooperation and Development (OECD)",
        color: "bg-yellow-400",
        date: "Open Government Data Report",
        stars: 4,
        text: "Open government data is only as valuable as its ability to be understood and used. Releasing data is not enough; governments must bridge the data literacy gap to empower citizens to turn information into meaningful action.",
    },
    {
        id: 2,
        name: "European Commission (Eurostat)",
        color: "bg-emerald-500",
        date: "European Statistics Code of Practice",
        stars: 5,
        text: "High-quality statistics and open data are essential, but data without context is noise. Translating complex statistical data into clear, understandable knowledge is vital for democratic accountability and informed public debate.",
    },
    {
        id: 3,
        name: "IPCC / UN Climate Change Network",
        color: "bg-cyan-400",
        date: "Synthesis Report on Climate Communication",
        stars: 4,
        text: "Without reliable, accessible, and understandable data, citizens cannot grasp the scale of global crises like climate change or hold institutions accountable for their commitments. Data clarity is the foundation of climate action.",
    },
    {
        id: 4,
        name: "UNESCO / United Nations",
        color: "bg-cyan-400",
        date: "Report on Public Information and Civic Empowerment",
        stars: 4,
        text: "Information is a public good, but an overload of unverified or obscure data creates a fog of confusion. We must turn the vast flood of information into actionable knowledge so that people can active participants in their societies.",
    },
    {
        id: 5,
        name: "World Bank Group",
        color: "bg-cyan-400",
        date: "World Development Report: Data for Better Lives",
        stars: 4,
        text: "Transparency without legibility is an empty promise. To empower communities, data must move from technical repositories into public understanding, turning raw figures into tools for sustainable development.",
    },
];

const DEFAULT_TEXT = "Why Sunflower is the right instrument for the nowadays life? Global Perspectives on Data, Transparency, and Civic Understanding.";

// ================= SOTTO-COMPONENTE PER LE PAROLE (STAGGER NATIVO) =================
function StaggeredWord({ text, active, delay }) {
    const wordRef = useRef(null);
    const prevActive = useRef(false);

    useGSAP(() => {
        if (!wordRef.current) return;

        if (active) {
            // Configurazione iniziale invisibile
            gsap.set(wordRef.current, { y: 24, opacity: 0 });

            // Animazione identica alla tua versione React Native (Cubic Out)
            gsap.to(wordRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.85,
                delay: delay / 1000,
                ease: "power3.out",
            });
        } else if (prevActive.current) {
            // Animazione di uscita (Cubic In)
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
        <span className="inline-block overflow-hidden py-1">
            <span
                ref={wordRef}
                className="inline-block opacity-0 translate-y-6 will-change-transform pr-[0.28em]"
            >
                {text}
            </span>
        </span>
    );
}

// ================= COMPONENTE PRINCIPALE RIUTILIZZABILE =================
export default function DraggableSection({
    text = DEFAULT_TEXT,
    reviews = DEFAULT_REVIEWS,
    staggerDelay = 35
}) {
    const sectionRef = useRef(null);
    const sliderRef = useRef(null);

    const [isTextActive, setIsTextActive] = useState(false);
    const [cardsActive, setCardsActive] = useState(false);
    const [extendedReviews, setExtendedReviews] = useState([]);

    // Stati per il Drag Nativo ad alte prestazioni
    const isDragging = useRef(false);
    const startX = useRef(0);
    const currentX = useRef(0);
    const targetX = useRef(0);
    const loopWidth = useRef(0);

    const wordsArray = text.split(" ");

    // 1. Duplichiamo le recensioni per creare l'effetto loop infinito nel DOM di React
    useEffect(() => {
        if (reviews.length > 0) {
            setExtendedReviews([...reviews, ...reviews, ...reviews]);
        }
    }, [reviews]);

    useGSAP(() => {
        const st = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top 80%",
            // Quando si entra scrollando verso il basso
            onEnter: () => gsap.delayedCall(0.5, () => {
                setIsTextActive(true);
                setCardsActive(true);
            }),

            // Quando si rientra scrollando verso l'alto
            onEnterBack: () => gsap.delayedCall(0.5, () => {
                setIsTextActive(true);
                setCardsActive(true);
            }),

            // Quando si esce verso l'alto (l'utente torna su)
            onLeave: () => {
                setIsTextActive(false);
                setCardsActive(false);
            },

            // Quando si esce verso il basso (l'utente prosegue la navigazione)
            onLeaveBack: () => {
                setIsTextActive(false);
                setCardsActive(false);
            },
            invalidateOnRefresh: true,
        });

        // Force a recalculation once everything (images, R3F canvas, fonts) has
        // finished laying out, so "bottom bottom" isn't computed against a stale document height
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);

        return () => {
            st.kill();
            window.removeEventListener("load", onLoad);
        };
    }, { scope: sectionRef });

    // Separate effect just for slider math + ticker, driven by extendedReviews
    useGSAP(() => {
        if (sliderRef.current && extendedReviews.length > 0 && !cardsActive) {
            gsap.set(sliderRef.current.children, { opacity: 0, y: 40 });
        }

        // Measure card width regardless of cardsActive — layout is unaffected by opacity
        if (sliderRef.current && extendedReviews.length > 0) {
            const cards = sliderRef.current.children;
            if (cards.length > 0) {
                const singleCardWidth = cards[0].getBoundingClientRect().width + 24; // width + gap
                loopWidth.current = singleCardWidth * reviews.length;
            }
        }

        if (!cardsActive || !sliderRef.current) return;
        gsap.to(sliderRef.current.children, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
        });

        const ticker = () => {
            if (!sliderRef.current || loopWidth.current === 0) return;

            if (!isDragging.current && Math.abs(velocity.current) > 0.02) {
                targetX.current += velocity.current;
                velocity.current *= 0.94;
            }

            currentX.current += (targetX.current - currentX.current) * 0.15;

            if (currentX.current < -loopWidth.current) {
                currentX.current += loopWidth.current;
                targetX.current += loopWidth.current;
            } else if (currentX.current > 0) {
                currentX.current -= loopWidth.current;
                targetX.current -= loopWidth.current;
            }

            gsap.set(sliderRef.current, { x: currentX.current });
        };

        gsap.ticker.add(ticker);
        return () => gsap.ticker.remove(ticker);
    }, [extendedReviews, cardsActive, reviews.length]);

    // Gestori degli eventi Pointer (Mouse e Touch unificati)
    const velocity = useRef(0);
    const lastTime = useRef(0);

    const handlePointerDown = (e) => {
        isDragging.current = true;
        startX.current = e.clientX - targetX.current;
        velocity.current = 0;
        lastTime.current = performance.now();
        sliderRef.current.style.cursor = "grabbing";
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        const now = performance.now();
        const dt = Math.max(now - lastTime.current, 1);
        const newTargetX = e.clientX - startX.current;
        velocity.current = ((newTargetX - targetX.current) / dt) * 16;
        targetX.current = newTargetX;
        lastTime.current = now;
    };

    const handlePointerUp = () => {
        isDragging.current = false;
        if (sliderRef.current) sliderRef.current.style.cursor = "grab";
    };

    const renderStars = (count) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < count ? "text-neutral-200" : "text-neutral-700"}>
                ★
            </span>
        ));
    };

    return (
        <section ref={sectionRef} className="sf-reviews-section border-test">
            <div className="sf-reviews-container">

                {/* Intestazione con parole staggered */}
                <h4 className="sf-reviews-title">
                    {wordsArray.map((word, idx) => (
                        <StaggeredWord
                            key={idx}
                            text={word}
                            active={isTextActive}
                            delay={idx * staggerDelay}
                        />
                    ))}
                </h4>

                {/* Contenitore Carosello Draggable Nativo */}
                <div
                    className="sf-reviews-carousel"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <div
                        ref={sliderRef}
                        className="sf-reviews-slider"
                        style={{ cursor: "grab" }}
                    >
                        {extendedReviews.map((review, idx) => (
                            <div key={`${review.id}-${idx}`} className="sf-review-card">
                                <div>
                                    <div className="sf-review-card-header">
                                        {/*<div className="sf-review-stars">
                                            {renderStars(review.stars)}
                                        </div>*/}
                                        <div>{review.date}</div>
                                    </div>

                                    <div className="sf-review-user">
                                        <span className="sf-review-name">
                                            {review.name}
                                        </span>
                                        {/* Manteniamo solo la var di coda per il colore dinamico dello status */}
                                        <span className={`sf-review-dot ${review.color}`} />
                                    </div>
                                </div>

                                <p className="sf-review-text">
                                    {review.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
