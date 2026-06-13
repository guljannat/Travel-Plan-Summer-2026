import { Language } from '../types';
import { translations } from '../utils';
import { Globe, Calendar, MapPin } from 'lucide-react';

interface TripHeaderProps {
  currentLang: Language;
  onSetLang: (lang: Language) => void;
  startDate: string;
  endDate: string;
}

export default function TripHeader({
  currentLang,
  onSetLang,
  startDate,
  endDate,
}: TripHeaderProps) {
  const dict = translations[currentLang];

  // Map dates to localized format
  const formatTripDates = () => {
    try {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const locale = currentLang === 'az' ? 'az-AZ' : 'en-US';
      const start = new Date(startDate).toLocaleDateString(locale, options);
      const end = new Date(endDate).toLocaleDateString(locale, options);
      return `${start} — ${end}`;
    } catch {
      return 'July 14 — August 20, 2026';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-brand-sand py-6 px-4 md:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title area */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="flex items-center gap-1 bg-brand-terracotta/10 text-brand-terracotta text-xs font-mono font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border border-brand-terracotta/20">
              <MapPin className="w-3.5 h-3.5" />
              US East Coast Roadtrip
            </span>
            <span className="flex items-center gap-1 bg-brand-sage/10 text-brand-sage-dark text-xs font-mono font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border border-brand-sage/20">
              <Calendar className="w-3.5 h-3.5" />
              38 {currentLang === 'az' ? 'Gün' : 'Days'}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-3.5xl font-serif font-black tracking-tight text-brand-charcoal">
            {dict.title}
          </h1>
          <p className="text-sm md:text-base text-brand-muted mt-1 max-w-2xl leading-relaxed font-sans">
            {dict.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Calendar dates display */}
          <div className="hidden lg:flex items-center gap-2 bg-brand-cream-dark/50 border border-brand-sand rounded-xl px-4 py-2.5 text-xs font-mono text-brand-charcoal">
            <Calendar className="w-4 h-4 text-brand-muted" />
            <span className="font-semibold">{formatTripDates()}</span>
          </div>

          {/* Localization Toggle Selector */}
          <div className="flex items-center p-1 bg-brand-cream-dark rounded-xl border border-brand-sand">
            <button
              onClick={() => onSetLang('az')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                currentLang === 'az'
                  ? 'bg-white text-brand-terracotta shadow-xs border border-brand-sand'
                  : 'text-brand-muted hover:text-brand-charcoal hover:bg-white/55'
              }`}
              id="lang-btn-az"
            >
              <Globe className="w-3.5 h-3.5" />
              AZ
            </button>
            <button
              onClick={() => onSetLang('en')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-white text-brand-terracotta shadow-xs border border-brand-sand'
                  : 'text-brand-muted hover:text-brand-charcoal hover:bg-white/55'
              }`}
              id="lang-btn-en"
            >
              <Globe className="w-3.5 h-3.5" />
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
