import { useEffect, useRef } from "react";
import avatar1Url from "@/assets/avatars/about-doctor-1.jpg";
import avatar2Url from "@/assets/avatars/about-doctor-2.jpg";
import avatar3Url from "@/assets/avatars/about-doctor-3.jpg";
import { Avatar, AvatarGroup, AvatarImage } from "@/components/ui/avatar";

const avatars = [
  { src: avatar1Url, alt: "Healthcare professional" },
  { src: avatar2Url, alt: "Medical specialist" },
  { src: avatar3Url, alt: "Doctor" },
] as const;

const trailingWords =
  "unifies Nigeria’s healthcare ecosystem, giving every patient lifelong access to their records and giving providers and payers verified data they can trust.".split(
    " ",
  );

export function AboutSection() {
  const paragraphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const paragraph = paragraphRef.current;
    if (!paragraph) return;

    const items = paragraph.querySelectorAll<HTMLElement>("[data-reveal-item]");
    if (items.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => {
        item.dataset.active = "true";
      });
      return;
    }

    function updateReveal() {
      if (!paragraph) return;
      const rect = paragraph.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Start revealing when the paragraph enters the lower 85% of the screen,
      // and finish revealing all words by the time it reaches the upper 25%.
      const start = viewportHeight * 0.85;
      const end = viewportHeight * 0.25;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const activeCount = Math.round(progress * items.length);

      items.forEach((item, index) => {
        if (index < activeCount) {
          item.dataset.active = "true";
        } else {
          delete item.dataset.active;
        }
      });
    }

    updateReveal();
    window.addEventListener("scroll", updateReveal, { passive: true });
    window.addEventListener("resize", updateReveal, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateReveal);
      window.removeEventListener("resize", updateReveal);
    };
  }, []);

  return (
    <section id="about" className="bg-fg-heading text-white">
      <div className="relative mx-auto max-w-360 px-4 pt-32 pb-20 lg:pt-40 lg:pb-40">
        {/* Architectural grid: side rails, a top rule, and a marker where they cross */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute inset-y-0 left-4 w-px bg-white/10 lg:left-21" />
          <span className="absolute inset-y-0 right-4 w-px bg-white/10 lg:right-21" />
          <span className="absolute inset-x-0 top-23.5 h-px bg-white/10" />
          <span className="absolute top-23.5 left-4 size-1.5 -translate-1/2 bg-white/10 lg:left-21" />
          <span className="absolute top-23.5 right-4 size-1.5 translate-x-1/2 -translate-y-1/2 bg-white/10 lg:right-21" />
        </div>

        <div className="relative flex flex-col items-center text-center">
          <span className="rounded-full bg-white/10 px-4 py-1.75 type-body-sm-medium tracking-widest text-white uppercase">
            About Us
          </span>

          <div ref={paragraphRef} className="mt-12 max-w-220 type-statement">
            <span
              data-reveal-item
              className="text-white/35 transition-colors duration-200 data-[active=true]:text-white"
            >
              DocuHealth{" "}
            </span>
            <AvatarGroup
              data-reveal-item
              className="inline-flex -space-x-1.5 align-middle opacity-40 transition-opacity duration-200 data-[active=true]:opacity-100 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-white"
            >
              {avatars.map((avatar) => (
                <Avatar key={avatar.alt} className="size-9 md:size-14">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                </Avatar>
              ))}
            </AvatarGroup>{" "}
            {trailingWords.map((word, index) => (
              <span
                key={`${index}-${word}`}
                data-reveal-item
                className="text-white/35 transition-colors duration-200 data-[active=true]:text-white"
              >
                {word}
                {index < trailingWords.length - 1 ? " " : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
