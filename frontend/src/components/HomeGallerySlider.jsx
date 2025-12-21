import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1600&h=900&fit=crop",
    alt: "Premium bathroom fittings collection",
    label: "Premium Bathroom Fittings",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&h=900&fit=crop",
    alt: "Modern taps and basins display",
    label: "Modern Taps & Basins",
  },
  {
    src: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1600&h=900&fit=crop",
    alt: "Kitchen sanitary fittings",
    label: "Kitchen Sanitary Essentials",
  },
  {
    src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1600&h=900&fit=crop",
    alt: "Hardware tools collection",
    label: "Hardware Tools & Accessories",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1600&h=900&fit=crop",
    alt: "Quality sanitary products",
    label: "Quality You Can Trust",
  },
];

export default function HomeGallerySlider({ images = DEFAULT_IMAGES }) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
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
    <section className="relative bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-end justify-between gap-6 mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Explore our collections
            </h2>
            <p className="mt-2 text-gray-600">
              Scroll down to see highlights from hardware & sanitary ranges.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow transition flex items-center justify-center"
              aria-label="Previous slide"
            >
              <FaChevronLeft className="text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow transition flex items-center justify-center"
              aria-label="Next slide"
            >
              <FaChevronRight className="text-gray-700" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main slide */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-gray-200 shadow-sm bg-gray-100 h-[320px] sm:h-[420px]">
              <img
                src={current.src}
                alt={current.alt}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/1600x900/4A5568/FFFFFF?text=Sanitary+Products";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-white/80 text-sm font-semibold">Featured</p>
                  <h3 className="text-white text-2xl sm:text-3xl font-extrabold">
                    {current.label}
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => go(i)}
                      className={`h-2.5 rounded-full transition-all ${
                        i === index ? "w-8 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile controls */}
            <div className="sm:hidden flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                Prev
              </button>
              <div className="text-sm text-gray-600">
                {index + 1} / {slides.length}
              </div>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                Next
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 rounded-3xl ring-1 ring-gray-200/70 p-4 h-full">
              <p className="text-sm font-semibold text-gray-700 mb-3">More photos</p>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {slides.slice(0, 4).map((img, i) => {
                  const realIndex = i;
                  const active = realIndex === index;
                  return (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => go(realIndex)}
                      className={`text-left overflow-hidden rounded-2xl ring-1 transition ${
                        active
                          ? "ring-blue-500 shadow-sm bg-white"
                          : "ring-gray-200 bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/200x200/4A5568/FFFFFF?text=Product";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {img.label}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{img.alt}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Tip: Use the search bar to find products by name, brand, or category.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


