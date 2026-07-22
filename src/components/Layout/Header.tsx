import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, LogOut, Leaf, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useProducts } from '../../contexts/ProductContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Product } from '../../types';

interface HeaderProps {
  onAuthClick: () => void;
  onCartClick: () => void;
}

// Reusable inline search with live dropdown
const SearchBar: React.FC<{ mobile?: boolean; isLight?: boolean }> = ({ mobile = false, isLight = false }) => {
  const { products } = useProducts();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      const term = query.toLowerCase();
      const filtered = products
        .filter(p =>
          p.name.toLowerCase().includes(term) ||
          (p.category && p.category.toLowerCase().includes(term)) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(term))
        )
        .slice(0, 6);
      setResults(filtered);
      setOpen(filtered.length > 0 || query.trim().length >= 2);
      setActiveIdx(-1);
    }, 220);
    return () => clearTimeout(timer);
  }, [query, products]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToSearch = useCallback(() => {
    if (!query.trim()) return;
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setOpen(false);
  }, [query, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        navigate(`/products/${results[activeIdx].id}`);
        setQuery('');
        setOpen(false);
      } else {
        goToSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${mobile ? 'w-full' : 'w-full max-w-sm'}`}>
      <div className="relative flex items-center group">
        <Search className={`absolute left-4 h-3.5 w-3.5 transition-colors ${isLight ? 'text-white/40 group-focus-within:text-white' : 'text-black/30 group-focus-within:text-black'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && results.length > 0 && setOpen(true)}
          placeholder="SEARCH COLLECTIONS"
          className={`w-full pl-10 pr-10 py-2.5 text-[10px] font-bold tracking-[0.2em] rounded-full border transition-all outline-none ${
            isLight 
              ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/20' 
              : 'bg-[#F9F9F9] border-black/[0.03] text-black placeholder:text-black/20 focus:bg-white focus:border-black/10'
          }`}
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className={`absolute right-3.5 p-1 rounded-full transition-colors ${isLight ? 'hover:bg-white/10 text-white/40' : 'hover:bg-black/5 text-black/20'}`}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden z-[200]"
          >
            {results.length > 0 ? (
              <div className="p-3">
                {results.map((product, idx) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    onClick={() => { setQuery(''); setOpen(false); }}
                    className={`flex items-center gap-4 px-3 py-2.5 rounded-2xl transition-all ${activeIdx === idx ? 'bg-[#F9F9F9]' : 'hover:bg-[#F9F9F9]'}`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F9F9F9]">
                      <img src={product.images?.[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-tight text-black truncate">{product.name}</p>
                      <p className="text-[10px] font-serif italic text-black/40">₹{product.price.toLocaleString('en-IN')}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-black/10" />
                  </Link>
                ))}
                <button
                  onClick={goToSearch}
                  className="w-full mt-2 py-3 text-[10px] font-black uppercase tracking-widest text-black bg-[#F9F9F9] hover:bg-black hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  View All Collections
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-[10px] text-black/30 font-black uppercase tracking-[0.2em]">No Matches Found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ onAuthClick, onCartClick }) => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { getSiteSetting } = useSettings();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';
  const siteName = getSiteSetting('site_name') || 'Aligarh Attarsavenue';
  const logoUrl = getSiteSetting('logo_url');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerStyles = useMemo(() => {
    if (isHome && !isScrolled) {
      return {
        bg: 'bg-transparent',
        text: 'text-white',
        logo: 'text-white',
        border: 'border-white/10',
        searchLight: true
      };
    }
    return {
      bg: 'bg-white/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]',
      text: 'text-black',
      logo: 'text-black',
      border: 'border-black/5',
      searchLight: false
    };
  }, [isHome, isScrolled]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${headerStyles.bg} ${isScrolled ? 'py-3' : 'py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-6 lg:gap-12">
            
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group min-w-0">
            <div className="transition-all duration-500 flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="AligarhAttarHouse Logo" className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover border border-stone-200/50 shadow-2xs group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-base sm:text-xl font-bold tracking-wide truncate ${headerStyles.logo}`}>
                Aligarh Attar House
              </span>
              <span className="text-[9px] sm:text-[11px] font-semibold tracking-wider text-stone-500 uppercase truncate -mt-0.5">
                Gaw Kadak, Sringar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {[
              { label: 'Collections', path: '/products' },
              { label: 'Editorial', path: '/about' },
              { label: 'Journal', path: '/blog' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2 text-[10px] font-semibold uppercase tracking-widest rounded-full transition-all hover:bg-black/5 ${headerStyles.text}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm">
            <SearchBar isLight={headerStyles.searchLight} />
          </div>

          {/* Actions - Heart and User hidden on mobile as they exist in bottom nav */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link
              to="/wishlist"
              className={`hidden sm:flex p-2 sm:p-3 rounded-full transition-all hover:bg-black/5 relative ${headerStyles.text}`}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-black rounded-full border-2 border-white ring-1 ring-black/10" />
              )}
            </Link>

            <div className="hidden sm:block relative" ref={userMenuRef}>
              <button
                onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : navigate('/auth')}
                className={`p-2 sm:p-3 rounded-full transition-all hover:bg-black/5 flex items-center gap-2 ${headerStyles.text}`}
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                {user && user.name && <span className="hidden xl:block text-[10px] font-semibold uppercase tracking-widest">{user.name.split(' ')[0]}</span>}
              </button>
              
              <AnimatePresence>
                {isUserMenuOpen && user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-black/5 py-3 z-50"
                  >
                    <div className="px-5 py-3 border-b border-black/[0.03]">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-black truncate">{user.name}</p>
                      <p className="text-[10px] text-black/50 mt-1 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-black/60 hover:bg-gray-50 hover:text-black rounded-xl transition-all">
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-black/60 hover:bg-gray-50 hover:text-black rounded-xl transition-all">
                        <ShoppingCart className="h-4 w-4" /> Order History
                      </Link>
                      <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={onCartClick}
              className={`ml-1 p-2 sm:p-3 rounded-full transition-all bg-black text-white hover:bg-black/90 relative shadow-sm active:scale-95`}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-white text-black text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
