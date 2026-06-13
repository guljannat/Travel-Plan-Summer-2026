import { useState } from 'react';
import { TripBlock, Language } from '../types';
import { translations } from '../utils';
import { Sparkles, Calendar, Coffee, Utensils, Compass, AlertCircle } from 'lucide-react';

interface AIAssistantProps {
  dayName: string;
  places: TripBlock[];
  lang: Language;
}

export default function AIAssistant({
  dayName,
  places,
  lang,
}: AIAssistantProps) {
  const dict = translations[lang];
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFetchSuggestions = async () => {
    setLoading(true);
    setError('');
    setAiSuggestions('');

    const placeNames = places
      .filter((b) => b.type === 'place')
      .map((b) => b.name);

    try {
      const response = await fetch('/api/suggest-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayName,
          places: placeNames,
          lang,
        }),
      });

      if (!response.ok) {
        throw new Error(lang === 'az' ? 'Süni zəka cavab vermədi.' : 'AI Server failed to respond.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiSuggestions(data.text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with server API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-brand-sand rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-sand pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-brand-sage/12 border border-brand-sage/20 text-brand-sage-dark rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-serif font-black text-brand-charcoal flex items-center gap-1.5">
              {dayName} — {dict.aiTitle}
            </h3>
            <p className="text-brand-muted text-xs mt-0.5 font-sans">
              {lang === 'az'
                ? 'Bu günlük marşrut üzrə ən maraqlı yolüstü yeməkxanaları və gizli yerləri kəşf edin.'
                : 'Discover fascinating off-grid regional eateries and scenic viewpoints along this day\'s path.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleFetchSuggestions}
          disabled={loading || places.length === 0}
          className="flex items-center justify-center gap-2 bg-brand-terracotta hover:bg-brand-terracotta/90 disabled:opacity-45 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer"
          id="btn-get-ai-suggestions"
        >
          <Sparkles className="w-4 h-4" />
          {lang === 'az' ? 'Süni Zəkadan Tövsiyələr Al' : 'Get AI Recommendations'}
        </button>
      </div>

      {places.length === 0 && (
        <div className="text-brand-muted text-sm py-8 text-center bg-brand-cream-dark/30 rounded-xl mt-6 border border-brand-sand">
          {lang === 'az'
            ? 'Hesablamalar üçün bu günə bəzi yerlər əlavə edilməlidir.'
            : 'Add some scheduled places to this day to enable AI itinerary tracking.'}
        </div>
      )}

      {places.length > 0 && (
        <div className="mt-6 space-y-6">
          {/* Active places for reference */}
          <div className="flex flex-wrap items-center gap-1.5 bg-brand-cream-dark/30 border border-brand-sand p-3 rounded-xl">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider font-mono mr-1">
              {lang === 'az' ? 'Marşrut Nöqtələri:' : 'Route Stops:'}
            </span>
            {places
              .filter((b) => b.type === 'place')
              .map((b, i) => (
                <span
                  key={b.id}
                  className="bg-white border border-brand-sand text-brand-charcoal font-medium text-xs px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1 font-sans"
                >
                  <span className="w-4 h-4 rounded-full bg-brand-cream-dark text-[10px] font-bold text-brand-muted flex items-center justify-center border border-brand-sand">
                    {i + 1}
                  </span>
                  {b.name}
                </span>
              ))}
          </div>

          {/* AI Response Area */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-brand-terracotta border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-brand-charcoal font-medium animate-pulse font-sans">
                {dict.loadingAi}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-bold">{lang === 'az' ? 'Problem Yarandı' : 'AI Request Failed'}</p>
                <p className="mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && !aiSuggestions && (
            <div className="bg-brand-cream-dark/20 border border-brand-sand rounded-xl p-6 text-center text-brand-muted text-xs leading-relaxed max-w-xl mx-auto">
              <Compass className="w-8 h-8 stroke-1 text-brand-sand mx-auto mb-2" />
              {dict.aiPlaceholder}
            </div>
          )}

          {!loading && !error && aiSuggestions && (
            <div className="bg-brand-cream-dark/45 border border-brand-sand rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-3 text-brand-terracotta font-serif font-bold text-sm">
                <Sparkles className="w-4.5 h-4.5" />
                <span>{lang === 'az' ? 'Süni Zəka Bələdçi Təklifi' : 'Generative AI Route Report'}</span>
              </div>
              <div className="prose prose-zinc prose-sm whitespace-pre-line text-brand-charcoal leading-relaxed font-sans text-xs md:text-sm">
                {aiSuggestions}
              </div>
              <div className="mt-5 pt-3 border-t border-brand-sand flex flex-wrap gap-4 text-[10px] font-mono text-brand-muted">
                <span className="flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-brand-muted" />
                  {lang === 'az' ? 'Milli Dadlar' : 'Local Eateries'}
                </span>
                <span className="flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-brand-muted" />
                  {lang === 'az' ? 'Restoran & Kafelər' : 'Recommended Sights'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
