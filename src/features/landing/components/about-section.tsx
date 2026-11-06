import { useEffect, useRef } from "react";
import avatar1Url from "@/assets/avatars/avatar-1.jpg";
import avatar2Url from "@/assets/avatars/avatar-2.jpg";
import avatar3Url from "@/assets/avatars/avatar-3.jpg";
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
  const paragraphRef = useRef<HTMLParagraphElement>(null);

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
    <section id="about" className="w-full bg-fg-heading text-white">
      {/* Top architectural grid band */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="h-12 border-x border-white/10 md:h-20" />
      </div>

      {/* Main framed section */}
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col items-center border-x border-white/10 px-4 py-20 text-center sm:px-8 md:py-28 lg:py-36">
            {/* Corner intersection markers */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-1 -left-1 size-2 bg-white/25"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -top-1 -right-1 size-2 bg-white/25"
            />

            <span className="rounded-full bg-white/10 px-4 py-1.5 type-label text-white/90">
              About Us
            </span>

            <p
              ref={paragraphRef}
              className="mt-8 max-w-4xl type-accent-h2 sm:type-accent-h1 md:type-h2"
            >
              <span
                data-reveal-item
                className="text-fg-caption transition-colors duration-200 data-[active=true]:text-white"
              >
                DocuHealth{" "}
              </span>
              <AvatarGroup
                data-reveal-item
                className="mx-1.5 inline-flex -space-x-3 align-middle opacity-40 transition-opacity duration-200 data-[active=true]:opacity-100 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-white"
              >
                {avatars.map((avatar) => (
                  <Avatar key={avatar.alt} className="size-8 sm:size-10 md:size-12">
                    <AvatarImage src={avatar.src} alt={avatar.alt} />
                  </Avatar>
                ))}
              </AvatarGroup>{" "}
              {trailingWords.map((word, index) => (
                <span
                  key={`${index}-${word}`}
                  data-reveal-item
                  className="text-fg-caption transition-colors duration-200 data-[active=true]:text-white"
                >
                  {word}
                  {index < trailingWords.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
