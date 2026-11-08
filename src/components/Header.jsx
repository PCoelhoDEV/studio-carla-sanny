import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Phone, SlidersHorizontal, Eye } from 'lucide-react';

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function Header({ 
  studioInfo, 
  largeTextMode, 
  setLargeTextMode, 
  onOpenAdmin 
}) {
  return (
    <header className="relative bg-gradient-to-b from-rose-100/90 via-rose-50/70 to-transparent pt-6 pb-4 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        {/* Top bar with accessibility and quick actions */}
        <div className="flex items-center justify-between mb-4">
          {/* Large text accessibility toggle */}
          <button
            onClick={() => setLargeTextMode(!largeTextMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              largeTextMode 
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                : 'bg-white/90 text-rose-800 border-rose-200 hover:bg-rose-50'
            }`}
            title="Aumentar tamanho do texto para facilitar a leitura"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{largeTextMode ? 'Letras Normais' : '🔍 Letras Grandes'}</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={`https://instagram.com/${studioInfo.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-rose-700 hover:text-rose-900 border border-rose-200 shadow-xs transition-transform active:scale-95"
              title="Instagram do Studio"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            <Link
              to="/cbarbosa"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-stone-600 hover:text-stone-900 border border-rose-200 shadow-xs transition-transform active:scale-95"
              title="Área da Carla (Admin / Agenda)"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Profile and branding card */}
        <div className="apple-card rounded-3xl p-5 text-center apple-shadow border border-rose-100 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />

          {/* Carla's photo with gold/rose ring */}
          <div className="relative inline-block mx-auto mb-3">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-rose-400 via-pink-300 to-rose-200 shadow-md">
              <img
                src="/carla-profile.jpg"
                alt="Carla Sanny"
                className="w-full h-full object-cover rounded-full bg-white"
                onError={(e) => {
                  // Fallback avatar if image isn't loaded
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80";
                }}
              />
            </div>
            <span className="absolute bottom-1 right-1 bg-rose-500 text-white rounded-full p-1 shadow-sm border-2 border-white">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Title & Tagline */}
          <h1 className={`font-serif-title font-bold text-stone-900 tracking-tight ${largeTextMode ? 'text-2xl' : 'text-xl'}`}>
            {studioInfo.name}
          </h1>

          <p className="text-rose-600 font-medium text-xs sm:text-sm mt-1 flex items-center justify-center gap-1">
            <span>✨</span>
            <span>{studioInfo.tagline}</span>
            <span>✨</span>
          </p>

          {/* Specialties pills */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-3 pt-3 border-t border-rose-100/80">
            {studioInfo.specialties.map((item, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-200/60"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
