import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Same look as the doctor's TabComponent2, but the active tab is controlled by the parent
const AdvanceCheckUpTabComponent = ({ tabs, activeTab, setActiveTab }) => {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollIndicators = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 4);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        updateScrollIndicators();

        el.addEventListener("scroll", updateScrollIndicators, { passive: true });
        window.addEventListener("resize", updateScrollIndicators);

        let observer;
        if (typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(updateScrollIndicators);
            observer.observe(el);
        }

        return () => {
            el.removeEventListener("scroll", updateScrollIndicators);
            window.removeEventListener("resize", updateScrollIndicators);
            if (observer) observer.disconnect();
        };
    }, [tabs, updateScrollIndicators]);

    const handleScrollBy = (direction) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const scrollAmount = Math.max(el.clientWidth * 0.6, 220);
        el.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <div className="w-full py-3 mx-auto">
            <div className="relative sm:mb-5">
                {canScrollLeft && (
                    <div className="hidden sm:flex items-center absolute left-0 top-0 bottom-1.5 z-10 pr-6 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none">
                        <button
                            type="button"
                            onClick={() => handleScrollBy("left")}
                            aria-label="Scroll tabs left"
                            className="pointer-events-auto w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-docuhealth-primary hover:border-docuhealth-primary/40 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div
                    ref={scrollContainerRef}
                    className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:overflow-x-auto tab-scrollbar border-b-0 sm:border-b border-gray-200 pb-4 sm:pb-1"
                >
                    {tabs.map((t) => (
                        <button
                            key={t.status}
                            type="button"
                            onClick={(e) => {
                                setActiveTab(t.status);
                                e.currentTarget.scrollIntoView({
                                    behavior: "smooth",
                                    block: "nearest",
                                    inline: "nearest",
                                });
                            }}
                            className={`text-[13px] px-2 sm:px-6 py-2 sm:py-3 font-medium transition-colors duration-200 cursor-pointer text-center sm:whitespace-nowrap sm:shrink-0 rounded-lg sm:rounded-none ${
                                activeTab === t.status
                                    ? "bg-docuhealth-primary text-white sm:bg-transparent sm:text-docuhealth-primary sm:border-b-2 sm:border-docuhealth-primary font-semibold"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 sm:hover:bg-transparent sm:border-b-2 sm:border-transparent"
                            }`}
                        >
                            <span className="inline-flex items-center justify-center gap-1.5">
                                {t.title}
                                {/* Unread-style count so nurses see waiting tasks without opening the tab */}
                                {t.badge > 0 && (
                                    <span
                                        aria-label={`${t.badge} tasks`}
                                        className="min-w-[20px] h-5 px-1.5 rounded-full bg-green-500 text-white text-[11px] font-semibold leading-5 text-center shrink-0"
                                    >
                                        {t.badge > 99 ? "99+" : t.badge}
                                    </span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>

                {canScrollRight && (
                    <div className="hidden sm:flex items-center justify-end absolute right-0 top-0 bottom-1.5 z-10 pl-6 bg-gradient-to-l from-white via-white/95 to-transparent pointer-events-none">
                        <button
                            type="button"
                            onClick={() => handleScrollBy("right")}
                            aria-label="Scroll tabs right"
                            className="pointer-events-auto w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-docuhealth-primary hover:border-docuhealth-primary/40 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {tabs.find((t) => t.status === activeTab)?.content}
            </div>
        </div>
    );
};

export default AdvanceCheckUpTabComponent;
