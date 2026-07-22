import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, ChevronDown, CheckCircle, Quote, Flame, HeartHandshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AccordionItem {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  icon: React.ElementType;
}

const FAQS_ACCORDION: AccordionItem[] = [
  {
    id: 'heritage',
    title: 'Traditional Hydro-Distillation (Deg-Bhapka)',
    subtitle: 'Century-old copper still extraction technique',
    content: 'We distill natural flowers, rose petals, sandalwood, and aged Kashmiri Oudh in traditional copper stills without synthetic solvents. This centuries-old deg-bhapka method preserves the true, living essence of natural botanicals.',
    icon: Flame,
  },
  {
    id: 'purity',
    title: '100% Pure Alcohol-Free Assurance',
    subtitle: 'Zero synthetic alcohols or chemical extenders',
    content: 'Every single attar oil formulation is 100% alcohol-free and phthalate-free. Formulated for direct application on skin and garments, ideal for daily prayer, meditation, and luxury fragrance lovers.',
    icon: ShieldCheck,
  },
  {
    id: 'artisan',
    title: 'Direct Master Sourcing & Fair Trade',
    subtitle: 'Supporting traditional Indian fragrance families',
    content: 'By working directly with master distillers across Aligarh and Kannauj without middlemen, we preserve historic fragrance recipes while ensuring local artisan families receive fair wages for their craft.',
    icon: HeartHandshake,
  },
  {
    id: 'quality',
    title: 'Personal Master Quality Verification',
    subtitle: 'Every batch personally inspected before dispatch',
    content: 'Before any bottle is sealed, our founder personally checks the scent profile, top-note clarity, and sillage depth to ensure it meets the rigorous Aligarh Attar House standard of luxury.',
    icon: Award,
  },
];

export const FounderStorySection: React.FC = () => {
  const [openId, setOpenId] = useState<string>('heritage');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? '' : id);
  };

  return (
    <section className="py-8 sm:py-16 bg-[#FBF9F5] text-stone-900 border-y border-stone-200/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Founder Card - Responsive Mobile Overhaul */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-8 shadow-xs mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 lg:gap-8">
            
            {/* Founder Portrait & Badge */}
            <div className="flex-shrink-0 text-center flex flex-col items-center">
              <div className="w-28 h-34 sm:w-44 sm:h-52 rounded-2xl overflow-hidden border border-stone-300 shadow-xs bg-stone-100">
                <img
                  src="/admin.jpg"
                  alt="Master Perfumer & Founder - Aligarh Attar House"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="mt-2 text-center">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 block leading-tight">Master Perfumer</h4>
                <p className="text-[10px] sm:text-xs text-stone-500 font-medium block">Founder · Aligarh Attar House</p>
              </div>
            </div>

            {/* Founder Message & Heritage Details */}
            <div className="flex-1 text-center md:text-left space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-[10px] font-bold uppercase tracking-wider">
                <Quote className="w-3 h-3 text-stone-700" />
                Heritage & Quality Guarantee
              </div>

              <h3 className="text-xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
                Authentic Craftsmanship from Aligarh
              </h3>

              <p className="text-stone-700 text-xs sm:text-base leading-relaxed italic font-serif bg-stone-50/80 p-3 sm:p-4 rounded-xl border border-stone-200/60">
                "Every drop of attar we bottle is pure, 100% alcohol-free, and hand-inspected to preserve centuries of authentic Indian fragrance heritage."
              </p>

              {/* Trust Pill Highlights — Responsive & Non-clumsy */}
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 pt-1 text-[11px] sm:text-xs font-semibold text-stone-800">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5 text-stone-800 flex-shrink-0" />
                  <span>30+ Years Experience</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5 text-stone-800 flex-shrink-0" />
                  <span>100% Alcohol-Free</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5 text-stone-800 flex-shrink-0" />
                  <span>Copper Deg-Bhapka Distilled</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Collapsible Authenticity Pillars Accordion */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
              Why Patrons Trust Our House
            </span>
            <Link to="/about" className="text-xs font-bold text-stone-900 hover:underline flex items-center gap-1">
              Read Full Story <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FAQS_ACCORDION.map((item) => {
              const isOpen = openId === item.id;
              const Icon = item.icon;

              return (
                <div 
                  key={item.id} 
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'bg-white border-stone-400 shadow-xs ring-1 ring-stone-900/10' 
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOpen ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{item.title}</h4>
                        <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-stone-900' : ''
                    }`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/40">
                          {item.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default FounderStorySection;
