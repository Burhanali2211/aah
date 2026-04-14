import React from 'react';
import { MapPin, Award, Clock, Leaf, Globe, Truck, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();
  const { contactInfo, businessHours } = settings;

  const addressContact = contactInfo.find(c => c.contact_type === 'address' && c.is_primary) ||
                         contactInfo.find(c => c.contact_type === 'address');
  const address = addressContact?.value || 'Aligarh, Uttar Pradesh, India';

  const formatBusinessHours = () => {
    if (!businessHours || businessHours.length === 0) {
      return 'Monday - Saturday: 10:00 AM - 6:00 PM';
    }
    const openDays = businessHours.filter(bh => bh.is_open);
    if (openDays.length === 7) {
      const firstDay = businessHours.find(bh => bh.is_open);
      if (firstDay?.is_24_hours) return 'Open 24/7';
      if (firstDay?.open_time && firstDay?.close_time) {
        return `Monday - Sunday: ${firstDay.open_time} - ${firstDay.close_time}`;
      }
    }
    return 'Monday - Saturday: 10:00 AM - 6:00 PM';
  };

  const hours = formatBusinessHours();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-white pt-14">

      {/* ── Hero ── */}
      <div className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=1600&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-serif font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Aligarh Attars
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-stone-300 font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Pure Traditional Fragrances & Concentrated Perfume Oils
            </motion.p>
            <motion.div
              className="flex items-center justify-center text-stone-400 text-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <MapPin className="mr-2 h-5 w-5" />
              <span>{address}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Our Story ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6">Our Story</h2>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Aligarh Attars was born from a deep respect for traditional perfumery and the timeless beauty of natural essences. 
                Our journey began with a simple mission: to preserve and share the legendary fragrance heritage of Aligarh with the world, 
                bringing pure, long-lasting attars to those who value authenticity above all.
              </p>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                We believe that every drop of attar carries the essence of nature and the soul of the perfumer. From our signature 
                Deg-Bhapka distilled Rose and Shamama to our exquisite Oud blends, 
                every Aligarh Attars creation is a testament to skills passed down through generations.
              </p>
              <p className="text-lg text-stone-600 leading-relaxed">
                By choosing Aligarh Attars, you're not just buying a fragrance; you're supporting a traditional craft and 
                embracing a pure, alcohol-free path. We are committed to using premium natural ingredients and ethical 
                extraction processes that honor both tradition and the environment.
              </p>
            </motion.div>

            <motion.div className="relative" variants={itemVariants}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800&q=80"
                  alt="Traditional Attar Distillation"
                  crossOrigin="anonymous"
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-stone-900 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-sm text-stone-300">Pure & Alcohol-Free</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
              The Aligarh Attars Standard
            </h2>
            <p className="text-lg text-stone-500 max-w-3xl mx-auto">
              We define quality through natural essences, traditional distillation, and exquisite profiles
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Leaf, title: 'Natural & Pure', text: 'We use the finest botanicals, spices, and resins. No synthetic fixatives or harsh chemicals — just pure, concentrated oil.' },
              { icon: Scissors, title: 'Deg-Bhapka Distilled', text: 'Our attars are distilled using the centuries-old copper vessel method. This preserves the delicate aromatic molecules for a superior fragrance profile.' },
              { icon: Award, title: 'Pure Artistry', text: 'Our blends are crafted with a focus on depth and complexity. We ensure each creation tells a unique story that resonates with your personal style.' },
            ].map(({ icon: Icon, title, text }) => (
              <motion.div
                key={title}
                className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm text-center hover:shadow-md transition-shadow duration-300"
                variants={itemVariants}
              >
                <div className="w-14 h-14 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Icon className="h-7 w-7 text-stone-700" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{title}</h3>
                <p className="text-stone-500 leading-relaxed text-sm">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Collections ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="order-2 lg:order-1" variants={itemVariants}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80"
                  alt="Fragrance Collection"
                  crossOrigin="anonymous"
                  className="w-full h-96 object-cover"
                />
              </div>
            </motion.div>

            <motion.div className="order-1 lg:order-2" variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6">
                Our Fragrance Collections
              </h2>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Explore a world of scents and sensations. Each collection is curated to evoke 
                emotion and character for every occasion.
              </p>
              <ul className="space-y-4">
                {[
                  ['Traditional Attars', 'Pure steam-distilled floral and herbal concentrates'],
                  ['Exquisite Perfumes', 'Premium EDPs with high oil concentration'],
                  ['Oud & Agarwood', 'Rare and aged oud oils and burning chips'],
                  ['Islamic Essentials', 'Musk, Amber, and Bakhoor for spiritual use'],
                  ['Gift Sets', 'Luxurious fragrance boxes for weddings and celebrations'],
                  ['Kids Fragrances', 'Gentle, light, and alcohol-free scents'],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-center gap-3 text-stone-700">
                    <span className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0" />
                    <span><strong className="text-stone-900">{title}</strong> — {desc}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-16 md:py-24 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Fragrance Ethics</h2>
            <p className="text-lg text-stone-400 max-w-3xl mx-auto">
              The principles behind every Aligarh Attars blend
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { title: 'Authenticity', text: 'We prioritize original recipes and traditional extraction methods.' },
              { title: 'Purity', text: 'Every drop is free from fillers, cheap synthetics, and harmful chemicals.' },
              { title: 'Heritage', text: 'We help keep the Aligarh perfumery tradition alive in a modern world.' },
              { title: 'Integrity', text: 'Honest ingredient sourcing and clear communication about scent notes.' },
            ].map(({ title, text }) => (
              <motion.div
                key={title}
                className="bg-white/5 p-6 rounded-xl border border-white/10"
                variants={itemVariants}
              >
                <h3 className="text-lg font-bold mb-3 text-orange-400">{title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Shipping & Contact ── */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
              Worldwide Delivery
            </h2>
            <p className="text-lg text-stone-500 max-w-3xl mx-auto">
              Bringing traditional Aligarh fragrances to your doorstep
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm h-full">
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Contact Us</h3>
                <div className="space-y-5">
                  {[
                    { icon: MapPin, label: 'Location', value: address },
                    { icon: Clock, label: 'Operating Hours', value: hours },
                    { icon: Truck, label: 'Shipping', value: 'Domestic India delivery · Worldwide express shipping' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-orange-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">{label}</p>
                        <p className="text-stone-500 text-sm mt-0.5 whitespace-pre-line">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100">
                  <h4 className="font-semibold text-stone-900 mb-2">Wholesale Inquiries</h4>
                  <p className="text-sm text-stone-500 mb-5 leading-relaxed">
                    Are you a retailer or distributor looking to carry our authentic fragrances? We offer wholesale 
                    opportunities and bulk customization.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div className="rounded-2xl overflow-hidden shadow-sm border border-stone-100 h-96 lg:h-auto" variants={itemVariants}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56417.89311689368!2d78.0558133!3d27.8974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974a48680076135%3A0x69f9e31d04113e6e!2sAligarh%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1711999999999!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Aligarh Attars Location"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
