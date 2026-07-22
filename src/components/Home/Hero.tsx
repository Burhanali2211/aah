import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const slides = [
  {
    image: '/images/hero/hero1.jpg',
    topTitle: 'New Fragrance Collection',
    titleMain: 'Pure Concentrated',
    titleSub: 'Attars',
    subtitle: '100% Alcohol-Free · Distilled Flowers & Aged Oudh Oils',
    cta: 'Discover Attars',
    ctaLink: '/products',
    accentColor: 'text-stone-300',
  },
  {
    image: '/images/hero/hero2.jpg',
    topTitle: 'Royal Heritage',
    titleMain: 'Kashmiri & Cambodian',
    titleSub: 'Oudh Oils',
    subtitle: 'Rare Vintage Formulations · Pure & Long-Lasting Sillage',
    cta: 'Shop Oudh Oils',
    ctaLink: '/products',
    accentColor: 'text-stone-300',
  },
  {
    image: '/images/hero/hero3.jpg',
    topTitle: 'French & Oriental',
    titleMain: 'Luxury EDP',
    titleSub: 'Perfumes',
    subtitle: 'Intense Eau De Parfum Sprays · Rich Floral & Spicy Trails',
    cta: 'Shop Perfumes',
    ctaLink: '/products',
    accentColor: 'text-stone-300',
  },
  {
    image: '/images/hero/hero4.jpg',
    topTitle: 'Islamic Literature',
    titleMain: 'Authentic',
    titleSub: 'Islamic Books',
    subtitle: 'Quran Tafseer, Hadith Collections & Spiritual Literature',
    cta: 'Browse Books',
    ctaLink: '/products',
    accentColor: 'text-stone-300',
  },
  {
    image: '/images/hero/hero5.jpg',
    topTitle: 'Modest Elegance',
    titleMain: 'Premium Modal',
    titleSub: 'Hijabs & Abayas',
    subtitle: 'Soft Breathable Fabrics · Everyday & Celebration Wear',
    cta: 'Explore Hijabs',
    ctaLink: '/products',
    accentColor: 'text-stone-300',
  },
];

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.1
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.8 },
      scale: { duration: 1.2, ease: "easeOut" }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.8 },
      scale: { duration: 1.2, ease: "easeIn" }
    }
  })
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.215, 0.61, 0.355, 1] as any,
      staggerChildren: 0.15,
      delayChildren: 0.4
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export const Hero: React.FC = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const current = Math.abs(page % slides.length);

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  useEffect(() => {
    const id = setInterval(() => paginate(1), 8000);
    return () => clearInterval(id);
  }, [paginate]);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-stone-900">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Background Image with Ken Burns Effect */}
          <motion.div 
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "linear" }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.titleMain}
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12">
              <motion.div 
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl"
              >
                <motion.p variants={itemVariants} className="flex items-center gap-4 text-white/80 font-bold tracking-[0.4em] text-[10px] sm:text-xs uppercase mb-8">
                  <span className="w-8 h-px bg-white/40" />
                  {slide.topTitle}
                </motion.p>
                
                <motion.h2 variants={itemVariants} className="text-white text-5xl sm:text-7xl md:text-9xl font-serif leading-[0.85] mb-6 sm:mb-8 tracking-tighter relative">
                  <span className="block font-light italic mb-1 sm:mb-2">{slide.titleMain}</span>
                  <span className="block font-black uppercase tracking-[-0.05em] ml-2 sm:ml-12 md:ml-20 break-words">{slide.titleSub}</span>
                </motion.h2>

                <motion.p variants={itemVariants} className={`text-sm sm:text-lg md:text-xl font-medium tracking-wide mb-12 max-w-lg ${slide.accentColor} opacity-90`}>
                  {slide.subtitle}
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-wrap gap-4 sm:gap-6 items-center">
                  <Link
                    to={slide.ctaLink}
                    className="group relative inline-flex items-center gap-3 sm:gap-4 bg-white text-stone-900 px-6 py-3.5 sm:px-10 sm:py-5 rounded-full overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10 text-xs sm:text-sm font-bold uppercase tracking-widest">
                      {slide.cta}
                    </span>
                    <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-2" />
                    <div className="absolute inset-0 bg-stone-100 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                  
                  <Link
                    to="/new-arrivals"
                    className="group flex items-center gap-4 text-white text-sm font-bold uppercase tracking-widest px-4 py-2 relative"
                  >
                    <span className="relative z-10">New Arrivals</span>
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-white" 
                    />
                    <span className="absolute bottom-0 left-4 right-10 h-px bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Editorial Details - Fixed outside AnimatePresence to avoid flickering */}
      <div className="absolute top-1/2 right-4 sm:right-8 lg:right-12 -translate-y-1/2 z-30 hidden sm:flex flex-col items-end gap-12">
        <motion.div 
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-end"
        >
          <span className="text-white/10 text-8xl md:text-9xl font-serif italic leading-none select-none">0{current + 1}</span>
          <span className="text-white/40 text-[10px] font-black tracking-[0.5em] uppercase mt-4 translate-x-4 rotate-90 origin-right">Edition 2024</span>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pb-12 hidden lg:flex flex-col items-center gap-6">
        <span className="text-[9px] text-white/40 uppercase tracking-[0.6em] font-black mb-2">Scroll to Explore</span>
        <div className="w-px h-20 bg-gradient-to-b from-white/40 via-white/10 to-transparent relative overflow-hidden">
          <motion.div 
            animate={{ y: [-40, 80] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-white/80" 
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-x-0 bottom-12 z-30 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6 pointer-events-auto">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > current ? 1 : -1])}
                className="group relative flex items-center gap-4 transition-all"
                aria-label={`Go to slide ${i + 1}`}
              >
                <div className="relative flex items-center justify-center">
                  <motion.div 
                    animate={{ 
                      width: i === current ? 12 : 6,
                      height: i === current ? 12 : 6,
                      backgroundColor: i === current ? '#ffffff' : 'rgba(255,255,255,0.2)'
                    }}
                    className="rounded-full" 
                  />
                  {i === current && (
                    <motion.div 
                      layoutId="activeDot"
                      className="absolute inset-0 w-6 h-6 border border-white/40 rounded-full -translate-x-1.5 -translate-y-1.5" 
                    />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="hidden sm:flex gap-4 pointer-events-auto">
            <button 
              onClick={() => paginate(-1)}
              className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-full transition-all group active:scale-90"
            >
              <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => paginate(1)}
              className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-full transition-all group active:scale-90"
            >
              <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden xl:block" />
    </section>
  );
};

export default Hero;
