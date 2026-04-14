import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionLink = motion(Link);

const WaterButton: React.FC<{ to: string, text: string }> = ({ to, text }) => {
  const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };

  return (
    <MotionLink
      to={to}
      onClick={handleClick}
      whileHover={{ 
        scale: 1.05, 
        y: -3,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={{ 
        scale: 0.96,
        y: 1,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      style={{
        boxShadow: 'inset 4px 4px 6px rgba(255, 255, 255, 0.4), inset -4px -4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.2)',
      }}
      className="inline-flex items-center gap-2 mt-6 bg-white/10 hover:bg-white/25 backdrop-blur-xl text-white border border-white/30 hover:border-white/60 text-xs sm:text-sm font-bold px-8 sm:px-10 py-3 sm:py-3.5 rounded-full transition-all duration-300 shadow-lg group relative overflow-hidden"
    >
      <span className="relative z-10 uppercase tracking-wider">{text}</span>
      <ChevronRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
      
      {/* Refraction Highlights */}
      <span className="absolute top-1.5 left-6 w-5 h-2 bg-white/30 rounded-full blur-[1px] rotate-[-5deg] pointer-events-none" />
      
      {/* Ripple Elements */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 15, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 5,
              filter: 'blur(4px)'
            }}
          />
        ))}
      </AnimatePresence>
    </MotionLink>
  );
};

const slides = [
  {
    image: '/images/hero/hero1.jpg',
    title: 'The Art of Attar',
    subtitle: 'Traditional Excellence in Every Drop',
    cta: 'Explore Collection',
    ctaLink: '/products',
  },
  {
    image: '/images/hero/hero2.jpg',
    title: 'Signature Scents',
    subtitle: 'Discover Your Unique Fragrance',
    cta: 'Shop Now',
    ctaLink: '/products',
  },
  {
    image: '/images/hero/hero3.jpg',
    title: 'Heritage Collection',
    subtitle: 'Timeless Aromas from Aligarh',
    cta: 'View Heritage',
    ctaLink: '/products',
  },
  {
    image: '/images/hero/hero4.jpg',
    title: 'Pure Essential Oils',
    subtitle: "Nature's Finest Concentrated for You",
    cta: 'Discover Oils',
    ctaLink: '/products',
  },
  {
    image: '/images/hero/hero5.jpg',
    title: 'Luxury Oudh',
    subtitle: 'Reinventing Ancient Traditions',
    cta: 'Shop Oudh',
    ctaLink: '/products',
  },
  {
    image: '/images/hero/hero6.jpg',
    title: 'Floral Bliss',
    subtitle: 'The Freshness of Handpicked Blooms',
    cta: 'Shop Florals',
    ctaLink: '/products',
  },
  {
    image: '/images/hero/hero7.jpg',
    title: 'Royal Blends',
    subtitle: 'Experience Excellence and Elegance',
    cta: 'View Blends',
    ctaLink: '/products',
  },
];

export const Hero: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const goTo = useCallback((index: number) => {
    if (transitioning || index === current) return;
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => setTransitioning(false), 400);
  }, [current, transitioning]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] lg:h-[520px] xl:h-[600px] overflow-hidden bg-stone-100">
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 ${
              hasMounted ? 'transition-opacity duration-700 ease-in-out' : ''
            } ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-hidden={i !== current}
          >
            <img
              src={slide.image}
              alt={slide.title}
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`w-full h-full object-cover ${
                hasMounted ? 'transition-transform duration-[4000ms] ease-out' : ''
              } ${i === current ? 'scale-105' : 'scale-100'}`}
            />
            {/* Softer, more modern overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80" />

            {/* Content Container - Centered & Calm */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="max-w-4xl px-6">
                <div className="space-y-4">
                  {/* Subtitle - Softer appearance */}
                  <div className={`transition-all duration-1000 transform ${
                    !hasMounted && i === current 
                      ? 'translate-y-0 opacity-100' 
                      : i === current ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-4 opacity-0'
                  }`}>
                    <p className="text-white/80 text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.2em] uppercase italic">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Title - More balanced sizing */}
                  <div className={`transition-all duration-1000 transform ${
                    !hasMounted && i === current 
                      ? 'translate-y-0 opacity-100' 
                      : i === current ? 'translate-y-0 opacity-100 delay-500' : 'translate-y-4 opacity-0'
                  }`}>
                    <h2 className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight tracking-tight drop-shadow-sm">
                      {slide.title}
                    </h2>
                  </div>

                  {/* Button - Water Click Experience with better hierarchy */}
                  <div className={`transition-all duration-1000 transform ${
                    !hasMounted && i === current 
                      ? 'translate-y-0 opacity-100' 
                      : i === current ? 'translate-y-0 opacity-100 delay-700' : 'translate-y-4 opacity-0'
                  }`}>
                    <WaterButton to={slide.ctaLink} text={slide.cta} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-0 pointer-events-none z-20 hidden md:block">
        <div className="max-w-[1440px] mx-auto h-full relative px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button 
            onClick={prev} 
            className="pointer-events-auto p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all border border-white/20 group translate-x-0"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:-translate-x-1" />
          </button>
          <button 
            onClick={next} 
            className="pointer-events-auto p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all border border-white/20 group"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Modern Progress Dots */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
