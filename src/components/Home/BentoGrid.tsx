import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Category } from '../../types';
import { getSafeImageUrl } from '../../utils/imageUrlUtils';

interface BentoGridProps {
  categories: Category[];
  loading?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as any }
  }
};

export const BentoGrid: React.FC<BentoGridProps> = ({ categories, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 animate-pulse">
        <div className="col-span-2 bg-gray-100 rounded-[2rem] h-[280px]" />
        <div className="col-span-1 bg-gray-100 rounded-[2rem] h-[280px]" />
        <div className="col-span-1 bg-gray-100 rounded-[2rem] h-[280px]" />
        <div className="col-span-2 bg-gray-100 rounded-[2rem] h-[280px]" />
      </div>
    );
  }

  // Filter out categories without images
  const validCategories = categories.filter(cat => {
    const rawUrl = cat.imageUrl || (cat as any).image_url;
    return !!rawUrl;
  });

  // We need exactly 4 categories for this layout
  const displayCats = validCategories.slice(0, 4);
  
  if (displayCats.length === 0) return null;

  const getCatImage = (cat: Category) => {
    const rawUrl = cat.imageUrl || (cat as any).image_url;
    return getSafeImageUrl(rawUrl, '/images/collection.png');
  };

  // Layout configuration for the 4 tiles
  const layout = [
    { wide: true, overlay: 'bg-gradient-to-r from-black/80 via-black/30 to-transparent' },
    { wide: false, overlay: 'bg-gradient-to-t from-black/80 via-black/20 to-transparent' },
    { wide: false, overlay: 'bg-gradient-to-t from-black/80 via-black/20 to-transparent' },
    { wide: true, overlay: 'bg-gradient-to-r from-black/80 via-black/40 to-transparent' }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8"
    >
      {displayCats.map((cat, index) => {
        const config = layout[index % layout.length];
        
        return (
          <motion.div
            key={cat.id}
            variants={itemVariants}
            className={config.wide ? 'col-span-2 md:col-span-2' : 'col-span-1'}
          >
            <Link
              to={`/products?category=${cat.id}`}
              className="group relative block overflow-hidden rounded-[2rem] h-[180px] sm:h-[280px] md:h-[340px] shadow-sm transition-all duration-700 bg-[#f8f9fa]"
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={getCatImage(cat)}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                />
              </div>
              <div className={`absolute inset-0 ${config.overlay} opacity-40 group-hover:opacity-70 transition-opacity duration-700`} />
              
              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end z-10">
                <div className="flex flex-col transform group-hover:-translate-y-2 transition-transform duration-700">
                  <span className="text-[8px] sm:text-[10px] font-black tracking-[0.3em] text-white/80 uppercase mb-2">
                    Collection
                  </span>
                  <p className="text-white font-serif italic text-xl sm:text-3xl md:text-4xl leading-[1.1] drop-shadow-2xl">
                    {cat.name}
                  </p>
                  <p className="text-white/80 text-[10px] sm:text-xs mt-2 font-medium tracking-[0.1em] max-w-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                    {cat.description || 'Explore our exclusive collection.'}
                  </p>
                </div>
              </div>

              {/* Hover Icon */}
              <div className="absolute top-6 right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 -rotate-45 group-hover:rotate-0 z-10">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
