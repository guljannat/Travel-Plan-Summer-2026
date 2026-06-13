import { TripSection, TripBlock, Language } from '../types';
import { translations, getOfflineRecommendations, getDistanceKm } from '../utils';
import { MapPin, Info, ArrowDown, Compass, ExternalLink, Calendar, Star } from 'lucide-react';

interface DayItineraryProps {
  section: TripSection;
  lang: Language;
  onSelectPlace: (place: TripBlock) => void;
  activePlace?: TripBlock | null;
  dayNumber: number;
}

export default function DayItinerary({
  section,
  lang,
  onSelectPlace,
  activePlace,
  dayNumber,
}: DayItineraryProps) {
  const dict = translations[lang];

  // Filter place blocks
  const placeBlocks = section.blocks.filter((b) => b.type === 'place');
  const noteBlocks = section.blocks.filter((b) => b.type === 'note');

  // Format localized heading
  const getLocalizedDayTitle = () => {
    const isAz = lang === 'az';
    const dayPrefix = isAz ? `${dayNumber}-cü Gün:` : `Day ${dayNumber}:`;
    if (section.heading) {
      return `${dayPrefix} ${section.heading}`;
    }
    return isAz ? `${dayNameTranslate(dayNumber)} Planı` : `Segment Tour #${dayNumber}`;
  };

  const dayNameTranslate = (num: number) => {
    return `${num}-cü gün`;
  };

  const offlineRecs = getOfflineRecommendations(section.heading || 'Roadtrip', lang);

  return (
    <div className="space-y-6">
      {/* Header Day Summary */}
      <div className="bg-brand-cream-dark/40 border border-brand-sand rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-serif font-black text-brand-charcoal tracking-tight">
              {getLocalizedDayTitle()}
            </h3>
            {/* Display static dates if standard sequential day */}
            <p className="text-brand-muted text-xs mt-1 font-mono font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-muted" />
              <span>{lang === 'az' ? 'Yay Marşrutu (İyul - Avqust 2026)' : 'Summer Tour Plan (July - Aug 2026)'}</span>
            </p>
          </div>
          {placeBlocks.length > 0 && (
            <div className="bg-brand-sage/12 text-brand-sage-dark border border-brand-sage/20 rounded-xl px-4 py-2 font-mono text-xs font-bold shrink-0">
              <span className="font-extrabold">{placeBlocks.length}</span> {lang === 'az' ? 'ziyarət nöqtəsi' : 'points of interest'}
            </div>
          )}
        </div>
      </div>

      {/* Main timeline listing */}
      {placeBlocks.length === 0 ? (
        <div className="text-brand-muted text-sm py-12 text-center bg-brand-cream-dark/30 rounded-2xl border border-brand-sand max-w-xl mx-auto">
          <Info className="w-8 h-8 stroke-1 text-brand-sand mx-auto mb-2" />
          {lang === 'az' ? 'Bu gün üçün xüsusi gəzinti obyekti təyin edilməyib.' : 'No historic outdoor sights recorded on this segment.'}
          {noteBlocks.length > 0 && (
            <div className="mt-4 px-4 max-w-md mx-auto text-left bg-white border border-brand-sand rounded-xl p-3">
              <p className="font-bold text-xs text-brand-charcoal uppercase tracking-wide font-mono mb-1">📝 {dict.noteLabel}:</p>
              {noteBlocks.map((nb, i) => (
                <p key={i} className="text-xs text-brand-charcoal font-sans">{nb.note}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline and Points list: LEFT PANEL */}
          <div className="lg:col-span-2 space-y-4">
            {placeBlocks.map((b, idx) => {
              const isSelected = activePlace && activePlace.id === b.id;
              
              // Compute distance to next node
              const nextBlock = placeBlocks[idx + 1];
              let distanceKm: number | null = null;
              if (
                b.lat !== undefined && b.lng !== undefined &&
                nextBlock && nextBlock.lat !== undefined && nextBlock.lng !== undefined
              ) {
                distanceKm = getDistanceKm(b.lat, b.lng, nextBlock.lat, nextBlock.lng);
              }

              return (
                <div key={b.id} className="relative">
                  {/* Outer card wrapper */}
                  <div
                    onClick={() => onSelectPlace(b)}
                    className={`bg-white border rounded-2xl p-5 hover:shadow-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-terracotta shadow-xs ring-4 ring-brand-terracotta/10'
                        : 'border-brand-sand hover:border-brand-terracotta/45'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Left timeline index bulb */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                          isSelected
                            ? 'bg-brand-terracotta text-white shadow-xs'
                            : 'bg-brand-cream-dark text-brand-muted'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-serif font-bold text-brand-charcoal transition-colors">
                            {b.name}
                          </h4>
                        </div>

                        {b.address && (
                          <p className="text-xs text-brand-muted mt-1 line-clamp-1 flex items-center gap-1 font-mono">
                            <MapPin className="w-3 h-3 text-brand-muted/75" />
                            <span>{b.address}</span>
                          </p>
                        )}

                        {/* Special display check-in notes */}
                        {b.note && (
                          <div className="mt-3 bg-brand-cream-dark/50 border border-brand-sand rounded-xl p-3 flex gap-2 overflow-hidden">
                            <Info className="w-4 h-4 text-brand-terracotta shrink-0 mt-0.5" />
                            <div className="text-xs text-brand-charcoal leading-relaxed font-sans font-medium">
                              {b.note}
                            </div>
                          </div>
                        )}

                        {b.description && (
                          <p className="text-xs text-brand-muted mt-3 line-clamp-2 leading-relaxed">
                            {b.description}
                          </p>
                        )}

                        {/* Actions buttons */}
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPlace(b);
                            }}
                            className="bg-brand-terracotta/10 hover:bg-brand-terracotta/18 text-brand-terracotta font-bold text-[11px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            id={`focus-btn-${b.id}`}
                          >
                            <Compass className="w-3.5 h-3.5" />
                            {lang === 'az' ? 'Xəritədə Fokusla' : 'Focus on Map'}
                          </button>
                          <a
                            href={b.googleUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name)}`}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white hover:bg-brand-cream-dark text-brand-charcoal font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all border border-brand-sand shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-brand-muted" />
                            {dict.directionsBtn}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Draw vertical route connection with distance arrow */}
                  {distanceKm !== null && (
                    <div className="flex items-center justify-center py-2 relative">
                      <div className="absolute left-[29px] top-0 bottom-0 w-0.5 bg-dotted bg-brand-sand"></div>
                      <div className="flex items-center gap-1.5 bg-white border border-brand-sand rounded-full px-3 py-1 text-[10px] font-mono text-brand-charcoal shadow-2xs z-10 font-bold">
                        <ArrowDown className="w-3 h-3 text-brand-muted shrink-0" />
                        <span>
                          {lang === 'az' ? 'Növbəti yer:' : 'Next place:'}{' '}
                          <span className="text-brand-terracotta font-extrabold">{distanceKm.toFixed(1)} km</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sights recommendations worth to see on the way: RIGHT PANEL */}
          <div className="bg-brand-cream-dark/30 border border-brand-sand rounded-xl p-5 h-fit space-y-4">
            <h4 className="text-sm font-bold text-brand-charcoal flex items-center gap-1.5 tracking-tight border-b border-brand-sand pb-3 font-serif">
              <Star className="w-4.5 h-4.5 text-brand-terracotta fill-brand-terracotta/70" />
              <span>{dict.recommendedPlacesOnWayTitle}</span>
            </h4>

            <div className="space-y-4">
              {offlineRecs.map((rec, i) => (
                <div key={i} className="bg-white border border-brand-sand shadow-2xs rounded-xl p-3.5 hover:shadow-xs transition-all">
                  <span className="text-[9px] font-bold text-brand-sage-dark bg-brand-sage/12 border border-brand-sage/20 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    {lang === 'az' ? 'YOLÜSTÜ GÖRMƏLİ' : 'MUST SEE'}
                  </span>
                  <h5 className="text-xs font-serif font-black text-brand-charcoal mt-1">{rec.name}</h5>
                  <p className="text-[11px] text-brand-muted mt-1 leading-relaxed font-sans">{rec.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-brand-muted leading-relaxed pt-2 italic">
              {lang === 'az'
                ? '* Bu tövsiyələr bölgələr üzrə əvvəlcədən təyin olunub. Daha ətraflı və restoran məsləhətləri üçün "Süni Zəka Bələdçisi" bölməsindən canlı istifadə edə bilərsiniz.'
                : '* These recommendations are pre-saved for instant offline viewing. Use the "AI Explorer" tab for live catering suggestions.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
