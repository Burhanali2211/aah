import React from 'react';
import { MapPin, Award, Heart, BookOpen, ShieldCheck, CheckCircle2, Quote, Flame, ArrowRight, Store, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();
  const { contactInfo } = settings;

  const addressContact = contactInfo.find(c => c.contact_type === 'address' && c.is_primary) ||
                         contactInfo.find(c => c.contact_type === 'address');
  const address = addressContact?.value || 'Aligarh Attar House, Main Market, Aligarh, Uttar Pradesh, 202001';

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900">

      {/* ── 1. Hero Header ── */}
      <div className="relative bg-stone-900 text-white overflow-hidden py-20 sm:py-28 border-b border-stone-800">
        <div className="absolute inset-0 bg-[url('/images/perfumes/kashmiri-oudh.jpeg')] bg-cover bg-center opacity-20 filter contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-stone-950/60" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-stone-200 text-[10px] font-bold uppercase tracking-[0.3em]"
          >
            <div className="w-3.5 h-3.5 text-amber-400" />
            Heritage Fragrance House · Est. Aligarh
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-stone-100 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Aligarh Attar House
          </motion.h1>

          <motion.p
            className="text-base sm:text-xl max-w-2xl mx-auto text-stone-300 font-light leading-relaxed italic font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            "A sanctuary of 100% pure alcohol-free attars, oriental perfumes, authentic Islamic literature & modest wear."
          </motion.p>

          <motion.div
            className="inline-flex items-center gap-2 text-stone-400 text-xs sm:text-sm font-medium bg-stone-900/90 px-4 py-2 rounded-xl border border-stone-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <MapPin className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>{address}</span>
          </motion.div>
        </div>
      </div>

      {/* ── 2. Master Perfumer & Heritage Story ── */}
      <section className="py-16 sm:py-24 bg-[#FBF9F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Founder Master Portrait */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-sm">
                <div className="rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-stone-100 aspect-[4/5]">
                  <img
                    src="/admin.jpg"
                    alt="Master Perfumer & Founder - Aligarh Attar House"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="mt-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs text-center">
                  <h3 className="font-serif font-bold text-stone-900 text-base">Master Perfumer & Founder</h3>
                  <p className="text-xs text-stone-500 font-medium">Aligarh Attar House · Head Distiller</p>
                </div>
              </div>
            </div>

            {/* Right: Story Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/80 text-stone-800 text-[10px] font-bold uppercase tracking-wider">
                <Quote className="w-3.5 h-3.5 text-stone-700" />
                Our Story & Vision
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 leading-tight">
                Preserving Centuries of Indian Fragrance Craftsmanship
              </h2>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                Aligarh Attar House was established with a singular commitment: to restore and honor traditional Indian perfume oil distillation. We work with classic copper stills (Deg-Bhapka) using wild harvested rose petals, sandalwood, Kashmiri saffron, and aged Oudh wood.
              </p>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                Every attar formulated in our house is 100% alcohol-free and phthalate-free, ideal for daily prayer, meditation, and connoisseurs who demand long-lasting natural projection on skin and garments.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-xl border border-stone-200">
                  <span className="text-2xl font-serif font-bold text-stone-900 block">30+ Yrs</span>
                  <span className="text-xs text-stone-500 font-medium">Distillation Legacy</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-stone-200">
                  <span className="text-2xl font-serif font-bold text-stone-900 block">100% Pure</span>
                  <span className="text-xs text-stone-500 font-medium">Alcohol-Free Attars</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Four Core House Pillars ── */}
      <section className="py-16 sm:py-20 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-3">Our Core Collections</h2>
            <p className="text-xs sm:text-sm text-stone-600">Handcrafted products prepared with authentic care and uncompromising quality.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-stone-200">
                  <img src="/images/perfumes/kashmiri-oudh.jpeg" alt="Pure Attars" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-base mb-1">Pure Alcohol-Free Attars</h3>
                <p className="text-xs text-stone-600 leading-relaxed">Concentrated oils including Kashmiri Oudh, Black Musk, Gulab, and Shamama.</p>
              </div>
              <Link to="/products?category=attars" className="mt-4 text-xs font-bold text-stone-900 hover:underline inline-flex items-center gap-1">
                Explore Attars <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-stone-200">
                  <img src="/images/perfumes/black-oudh.jpeg" alt="French & Arabic EDPs" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-base mb-1">French & Arabic EDPs</h3>
                <p className="text-xs text-stone-600 leading-relaxed">Long-lasting Eau de Parfum sprays with rich oriental & floral notes.</p>
              </div>
              <Link to="/products?category=perfumes" className="mt-4 text-xs font-bold text-stone-900 hover:underline inline-flex items-center gap-1">
                Explore Perfumes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-stone-200">
                  <img src="/images/perfumes/choco-musk.jpeg" alt="Islamic Literature" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-base mb-1">Islamic Literature</h3>
                <p className="text-xs text-stone-600 leading-relaxed">Quran Tafseer, Hadith collections, and authentic spiritual books.</p>
              </div>
              <Link to="/products?category=islamic-books" className="mt-4 text-xs font-bold text-stone-900 hover:underline inline-flex items-center gap-1">
                Explore Books <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pillar 4 */}
            <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-stone-200">
                  <img src="/images/perfumes/kashmiri-gulab.jpeg" alt="Modest Hijabs" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-base mb-1">Modest Hijabs & Abayas</h3>
                <p className="text-xs text-stone-600 leading-relaxed">Soft modal, jersey, and chiffon hijabs designed for modest elegance.</p>
              </div>
              <Link to="/products?category=hijabs" className="mt-4 text-xs font-bold text-stone-900 hover:underline inline-flex items-center gap-1">
                Explore Modest Wear <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. Guarantees ── */}
      <section className="py-16 bg-[#FBF9F5]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Our Authenticity & Satisfaction Promise
          </h2>
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            We inspect every batch, use leak-proof glass packaging, and offer direct master guidance. If you ever have a query about notes, longevity, or custom sizing, our Aligarh team is always ready to assist.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
