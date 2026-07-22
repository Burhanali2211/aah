import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, Store, MapPin, Quote } from 'lucide-react';

interface VisitorTestimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  product: string;
  rating: number;
  date: string;
  review: string;
  visitType: 'Store Visitor' | 'Verified Buyer';
}

const VISITOR_TESTIMONIALS: VisitorTestimonial[] = [
  {
    id: '1',
    name: 'Tariq Mansoor',
    location: 'Aligarh, UP',
    avatar: '/images/testimonial/user.jpg',
    product: 'Kashmiri Oudh & Pure Amber Attar',
    rating: 5,
    date: 'Store Visit · Jan 2025',
    review: 'Visited the Aligarh store in person to test their Oudh oils. The master distiller explained the extraction process. The projection and sillage of the Kashmiri Oudh lasts for over 24 hours on cotton clothes. 100% genuine alcohol-free attars!',
    visitType: 'Store Visitor',
  },
  {
    id: '2',
    name: 'Craye Maxiene',
    location: 'Paris, France (Europe)',
    avatar: '/images/testimonial/user2.jpg',
    product: 'Royal Oud EDP & Pure Rose Attar',
    rating: 5,
    date: 'International Order · Jan 2025',
    review: 'Ordered the Royal Oud EDP and Pure Rose Attar shipped directly to France. The sillage and longevity are incredible, and the luxury bottle packaging arrived safely without any leaks. Exquisite fragrance craft!',
    visitType: 'Verified Buyer',
  },
  {
    id: '3',
    name: 'Mohammad Bilal',
    location: 'Lucknow, UP',
    avatar: '/images/testimonial/user3.jpg',
    product: 'Black Musk & Shamama Oil',
    rating: 5,
    date: 'Store Visit · Dec 2024',
    review: 'The authenticity at Aligarh Attar House is unmatched. You can smell the purity immediately compared to cheap synthetic market oils. The founder personally helped me select a daily wear non-alcoholic attar.',
    visitType: 'Store Visitor',
  },
  {
    id: '4',
    name: 'Zubair Ahmed',
    location: 'Mumbai, MH',
    avatar: '/images/testimonial/user4.jpg',
    product: 'Quran Tafseer & Royal Amber EDP',
    rating: 5,
    date: 'Verified Order · Dec 2024',
    review: 'The package arrived safely in padded boxes. The Islamic literature typography and binding quality are top class, and the Royal Amber EDP spray has an incredible long-lasting oriental drydown.',
    visitType: 'Verified Buyer',
  },
  {
    id: '5',
    name: 'Zainab Rahmani',
    location: 'Hyderabad, TS',
    avatar: '/images/testimonial/user6.jpg',
    product: 'Gulab (Rose) Attar & Chiffon Scarf',
    rating: 5,
    date: 'Verified Order · Nov 2024',
    review: 'Smells like fresh rose petals harvested at dawn. No chemical sharpness or alcohol sting at all. My entire family loves the natural aroma!',
    visitType: 'Verified Buyer',
  },
  {
    id: '6',
    name: 'Syed Farhan',
    location: 'Bengaluru, KA',
    avatar: '/images/testimonial/user7.jpg',
    product: 'Majmua & Oriental Fragrance EDP',
    rating: 5,
    date: 'Store Visit · Nov 2024',
    review: 'Great hospitality at their main Aligarh store. They allowed us to sample all fragrance notes comfortably. The pricing is very honest considering the pure concentrated quality.',
    visitType: 'Store Visitor',
  },
];

export const StoreVisitorsTestimonials: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-stone-50 border-t border-stone-200/90 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-200/70 border border-stone-300 text-stone-800 text-[10px] font-bold uppercase tracking-[0.25em] mb-4"
          >
            <Store className="w-3.5 h-3.5 text-stone-700" />
            Verified Patron Reviews & Store Visits
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 leading-tight mb-4"
          >
            Loved by Store Visitors & Online Patrons
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-stone-600 text-sm sm:text-base leading-relaxed"
          >
            Real feedback and moments shared by customers who visited our Aligarh store or ordered our pure attars, oriental perfumes, Islamic books, and modesty wear.
          </motion.p>
        </div>

        {/* Testimonials Container: One horizontal scrolling line on mobile, grid on desktop */}
        <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-4 sm:gap-6 pb-4 md:pb-0 md:grid-cols-2 lg:grid-cols-3 no-scrollbar">
          {VISITOR_TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between w-[85vw] sm:w-[340px] md:w-auto flex-shrink-0 md:flex-shrink snap-start"
            >
              <div>
                {/* Header: User Info & Verification Badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    {/* User Avatar Photo */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-stone-200 shadow-xs flex-shrink-0 bg-stone-100">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">{item.name}</h3>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-stone-400" /> {item.location}
                      </p>
                    </div>
                  </div>

                  {/* Visit Type Badge */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200 flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-stone-800" />
                    {item.visitType}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ))}
                  <span className="text-stone-400 text-[10px] font-medium ml-1">5.0</span>
                </div>

                {/* Review Text */}
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic font-serif mb-4">
                  "{item.review}"
                </p>
              </div>

              {/* Footer: Purchased Product Tag */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="truncate font-semibold text-stone-800">
                  Purchased: <span className="text-stone-600 font-normal">{item.product}</span>
                </span>
                <span className="text-[10px] text-stone-400 flex-shrink-0 ml-2">{item.date}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Banner */}
        <div className="mt-12 text-center bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-base">Visit Our Main Aligarh Store</h4>
              <p className="text-xs text-stone-500">Experience our raw attars & scent profile testing in person</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-900 text-xs font-bold uppercase tracking-wider bg-stone-100 px-4 py-2.5 rounded-xl border border-stone-200">
            <div className="w-4 h-4 text-stone-700" /> 100% Genuine Heritage Guarantee
          </div>
        </div>

      </div>
    </section>
  );
};

export default StoreVisitorsTestimonials;
