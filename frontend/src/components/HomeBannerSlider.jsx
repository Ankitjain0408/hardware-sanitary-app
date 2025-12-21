import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DEFAULT_BANNERS = [
  {
    src: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1800&h=600&fit=crop",
    alt: "Premium sanitary fittings display",
    label: "Premium taps, fittings & accessories",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1800&h=600&fit=crop",
    alt: "Modern bathroom fixtures",
    label: "Modern bathroom fixtures & hardware",
  },
  {
    src: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1800&h=600&fit=crop",
    alt: "Sanitary hardware collection",
    label: "Complete sanitary & hardware solutions",
  },
];

export default function HomeBannerSlider({ banners = DEFAULT_BANNERS }) {
  const slides = useMemo(() => banners.filter(Boolean), [banners]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const go = (nextIdx) => {
    if (slides.length === 0) return;
    const bounded = ((nextIdx % slides.length) + slides.length) % slides.length;
    setIndex(bounded);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => go(index + 1), 4500);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slides.length]);

  if (slides.length === 0) return null;
  const current = slides[index];

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-gray-200 shadow-sm bg-gray-100 h-[220px] sm:h-[320px]">
          <img
            src={current.src}
            alt={current.alt}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/1800x400/4A5568/FFFFFF?text=Sanitary+%26+Hardware";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="px-6 sm:px-10 max-w-xl">
              <p className="text-white/80 text-sm font-semibold">Highlights</p>
              <h3 className="mt-2 text-white text-2xl sm:text-4xl font-extrabold leading-tight">
                {current.label}
              </h3>
            </div>
          </div>

          {/* Controls */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center"
                aria-label="Previous banner"
              >
                <FaChevronLeft className="text-gray-800" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center"
                aria-label="Next banner"
              >
                <FaChevronRight className="text-gray-800" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => go(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === index ? "w-8 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"
                    }`}
                    aria-label={`Go to banner ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}


