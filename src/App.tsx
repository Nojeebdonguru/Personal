import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Globe, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Mosque {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  website: string | null;
}

const CrescentMosqueIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Ground Line */}
    <path d="M2 22h20" />
    
    {/* Main Building Structure */}
    <path d="M5 22V17a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5" />
    
    {/* Main Dome */}
    <path d="M8 16c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5" />
    <path d="M12 11.5V10" />
    
    {/* Minarets */}
    <path d="M4 22V9l1-1 1 1v13" />
    <path d="M18 22V9l1-1 1 1v13" />
    
    {/* Minaret Details (Balconies) */}
    <path d="M3.5 13h2" />
    <path d="M18.5 13h2" />
    <path d="M3.5 17h2" />
    <path d="M18.5 17h2" />
    
    {/* Arched Entrance */}
    <path d="M10 22v-3a2 2 0 1 1 4 0v3" />
    
    {/* Crescent Moon & Star */}
    <g transform="translate(12, 6)">
      <path 
        d="M-1.5 -2.5c1.3 0 2.4 1.1 2.4 2.4s-1.1 2.4-2.4 2.4 1.5-1 1.5-2.4-1.5-2.4-1.5-2.4z" 
        fill="currentColor" 
        stroke="none" 
      />
      <path 
        d="M2 -3l.3.8.8.3-.8.3-.3.8-.3-.8-.8-.3.8-.3.3-.8z" 
        fill="currentColor" 
        stroke="none" 
      />
    </g>
  </svg>
);

export default function App() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMosques = async (params: { lat?: number; lng?: number; query?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.lat) queryParams.append('lat', params.lat.toString());
      if (params.lng) queryParams.append('lng', params.lng.toString());
      if (params.query) queryParams.append('query', params.query);

      const response = await fetch(`/api/mosques?${queryParams.toString()}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch mosques');
      }
      const data = await response.json();
      setMosques(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      fetchMosques({ query: search.trim() });
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchMosques({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e1e3e0] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#154212] p-3 rounded-2xl">
              <CrescentMosqueIcon className="text-white w-10 h-10" />
            </div>
            <h1 className="text-xl font-bold text-[#154212] tracking-tight">Mosque Finder</h1>
          </div>
          <button
            onClick={handleGPS}
            className="flex items-center gap-2 text-sm font-medium text-[#154212] hover:bg-[#e1e3e0] px-3 py-2 rounded-full transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Use GPS
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Search Section */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-extrabold text-[#154212] mb-4 tracking-tight">
              Find your prayer space.
            </h2>
            <p className="text-[#42493e] text-lg max-w-xl mx-auto">
              Discover peaceful mosques near your current location or search by city, state, or zip code.
            </p>
          </motion.div>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-[#72796e]" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter city, state, or zip code"
                className="w-full h-14 pl-12 pr-32 bg-white border-2 border-[#e1e3e0] rounded-2xl focus:ring-4 focus:ring-[#154212]/10 focus:border-[#154212] transition-all text-lg outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-[#154212] text-white px-6 rounded-xl font-semibold hover:bg-[#2d5a27] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>
        </section>

        {/* Results Section */}
        <section>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <div className="bg-red-100 p-1 rounded-full">
                <span className="text-lg">!</span>
              </div>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {mosques.map((mosque, index) => (
                <motion.div
                  key={mosque.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#e1e3e0] hover:shadow-md transition-shadow group"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-[#f2f4f1] p-4 rounded-[2rem] group-hover:bg-[#c9e8bf] transition-colors">
                        <CrescentMosqueIcon className="w-10 h-10 text-[#154212]" />
                      </div>
                      <div className="text-xs font-bold text-[#72796e] uppercase tracking-widest bg-[#f2f4f1] px-3 py-1 rounded-full">
                        Mosque
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#154212] mb-2 line-clamp-1">
                      {mosque.name}
                    </h3>
                    <div className="flex items-start gap-2 text-[#42493e] text-sm mb-6 flex-grow">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{mosque.address}</span>
                    </div>

                    <div className="flex gap-3">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#154212] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-[#2d5a27] transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        Navigate
                      </a>
                      {mosque.website && (
                        <a
                          href={mosque.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-[#f2f4f1] text-[#154212] py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-[#e1e3e0] transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {!loading && mosques.length === 0 && !error && (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-[#e1e3e0]">
              <div className="bg-[#f2f4f1] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#72796e]" />
              </div>
              <h3 className="text-xl font-bold text-[#154212] mb-2">No results yet</h3>
              <p className="text-[#72796e]">
                Search by city, state, or zip code or use GPS to find mosques nearby.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer Quote */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="bg-[#eceeeb] rounded-[2.5rem] py-12 px-8">
          <p className="text-2xl font-medium text-[#154212] italic mb-4 leading-snug">
            "Indeed, prayer has been decreed upon the believers a decree of specified times."
          </p>
          <p className="text-sm font-bold text-[#154212]/60 uppercase tracking-widest mb-4">
            Surah An-Nisa 4:103
          </p>
          <div className="w-12 h-1 bg-[#154212]/20 rounded-full mx-auto"></div>
        </div>
      </footer>
    </div>
  );
}
