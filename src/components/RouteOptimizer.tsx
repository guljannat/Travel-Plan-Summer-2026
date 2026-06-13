import { useState, useEffect } from 'react';
import { TripSection, TripBlock, Language } from '../types';
import { translations, optimizeRouteOrder, computeTotalPathDistance } from '../utils';
import { RefreshCw, ArrowRight, Zap, CheckCircle, Info, ChevronRight } from 'lucide-react';

interface RouteOptimizerProps {
  section: TripSection;
  lang: Language;
}

export default function RouteOptimizer({
  section,
  lang,
}: RouteOptimizerProps) {
  const dict = translations[lang];
  const [optimizedBlocks, setOptimizedBlocks] = useState<TripBlock[]>([]);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);

  const placeBlocks = section.blocks.filter((b) => b.type === 'place' && b.lat !== undefined && b.lng !== undefined);

  // Reset state when section changes
  useEffect(() => {
    setOptimizedBlocks([]);
    setIsOptimized(false);
  }, [section]);

  const handleOptimize = () => {
    // Solve Traveling Salesperson matching starting from index 0
    const optimized = optimizeRouteOrder(section.blocks);
    setOptimizedBlocks(optimized);
    setIsOptimized(true);
  };

  const originalDistance = computeTotalPathDistance(section.blocks);
  const optimizedDistance = isOptimized
    ? computeTotalPathDistance(optimizedBlocks)
    : originalDistance;

  const savedDistance = originalDistance - optimizedDistance;

  if (placeBlocks.length <= 2) {
    return (
      <div className="bg-white border border-brand-sand rounded-2xl p-6 text-center max-w-xl mx-auto">
        <Info className="w-8 h-8 stroke-1 text-brand-muted mx-auto mb-2" />
        <p className="text-brand-charcoal font-medium text-sm leading-relaxed font-sans">
          {lang === 'az'
            ? 'Bu gəzinti mərhələsində ziyarət ediləcək yerlərin sayı 2 və ya daha az olduğu üçün marşrut optimallaşdırılması tələb olunmur.'
            : 'Route optimization is not required for 1 or 2 spots. Enjoy your driving segment!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro info card */}
      <div className="bg-brand-sage/12 border border-brand-sage/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-brand-sage text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-black text-brand-charcoal leading-tight">
              {lang === 'az' ? 'Yolun Riyazi Model Optimizasiyası' : 'Mathematical Route Optimization'}
            </h3>
            <p className="text-brand-muted text-xs mt-1 leading-relaxed max-w-xl font-sans">
              {lang === 'az'
                ? 'İstirahət günündə gəzəcəyimiz bəzi nöqtələri ən rasional silsilə ilə düzmək üçün Traveling Salesperson (TSP) hesablama modelini icra edirik.'
                : 'Solve the shortest driving sequence across multiple locations using our TSP matrix solver to save fuel and time.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOptimize}
          disabled={isOptimized}
          className="flex items-center justify-center gap-2 bg-brand-terracotta hover:bg-brand-terracotta/90 disabled:bg-brand-sage disabled:cursor-default text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-xs self-start md:self-auto cursor-pointer"
          id="btn-opt-tsp"
        >
          {isOptimized ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{lang === 'az' ? 'Optimizə Olundu' : 'Optimized'}</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{dict.optimizeBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-white border border-brand-sand rounded-xl p-4 text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted">
            {lang === 'az' ? 'İLKİN MƏSAFƏ' : 'ORIGINAL DISTANCE'}
          </span>
          <p className="text-xl font-extrabold text-brand-charcoal mt-1">
            {originalDistance.toFixed(1)} km
          </p>
        </div>

        <div className="bg-white border border-brand-sand rounded-xl p-4 text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted">
            {lang === 'az' ? 'YENİ HESABLANMIŞ' : 'OPTIMIZED DISTANCE'}
          </span>
          <p className="text-xl font-extrabold text-brand-terracotta mt-1">
            {optimizedDistance.toFixed(1)} km
          </p>
        </div>

        <div className="bg-brand-sage/12 border border-brand-sage/20 rounded-xl p-4 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-sage-dark">
            {lang === 'az' ? 'QƏNAƏT OLUNAN YOL' : 'FUEL/DISTANCE SAVED'}
          </span>
          <p className="text-xl font-extrabold text-brand-sage-dark mt-1">
            {savedDistance > 0.05 ? `${savedDistance.toFixed(1)} km` : `0.0 km`}
          </p>
        </div>
      </div>

      {/* Side-by-side Flow Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Sequence */}
        <div className="bg-white border border-brand-sand rounded-2xl p-5 space-y-4 shadow-2xs">
          <h4 className="text-xs font-bold font-mono tracking-wider text-brand-muted uppercase border-b border-brand-sand pb-2 flex items-center justify-between">
            <span>{dict.originalOrderLabel}</span>
            <span className="text-brand-charcoal bg-brand-cream-dark px-2 py-0.5 rounded border border-brand-sand text-[10px]">
              {placeBlocks.length} {lang === 'az' ? 'Məkan' : 'Stops'}
            </span>
          </h4>
          <div className="space-y-3 font-sans">
            {placeBlocks.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3 bg-brand-cream-dark/20 p-2.5 rounded-xl border border-brand-sand/40">
                <span className="w-6 h-6 rounded-full bg-brand-cream-dark text-brand-muted flex items-center justify-center font-mono font-bold text-[10px]">
                  {i + 1}
                </span>
                <span className="text-xs font-bold text-brand-charcoal truncate">{b.name}</span>
                {i < placeBlocks.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-brand-sand ml-auto shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optimized Sequence */}
        <div className="bg-white border border-brand-sand rounded-2xl p-5 space-y-4 shadow-2xs">
          <h4 className="text-xs font-bold font-mono tracking-wider text-brand-terracotta uppercase border-b border-brand-sand pb-2 flex items-center justify-between">
            <span>{dict.optimizedOrderLabel}</span>
            {isOptimized ? (
              <span className="text-brand-sage-dark bg-brand-sage/12 px-2 py-0.5 rounded border border-brand-sage/20 text-[10px]">
                {lang === 'az' ? 'Optimal Həll Tapıldı' : 'Optimal Solution Map'}
              </span>
            ) : (
              <span className="text-brand-muted text-[10px] font-sans lowercase">
                {lang === 'az' ? 'Hesablama gözlənilir' : 'Click optimize above'}
              </span>
            )}
          </h4>
          <div className="space-y-3 font-sans">
            {isOptimized && optimizedBlocks.length > 0 ? (
              optimizedBlocks
                .filter((b) => b.type === 'place')
                .map((b, i) => (
                  <div key={b.id} className="flex items-center gap-3 bg-brand-terracotta/8 p-2.5 rounded-xl border border-brand-terracotta/14">
                    <span className="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-mono font-bold text-[10px] shadow-3xs">
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold text-brand-charcoal truncate">{b.name}</span>
                    {i < placeBlocks.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-brand-terracotta/60 ml-auto shrink-0" />
                    )}
                  </div>
                ))
            ) : (
              <div className="py-10 text-center text-brand-muted text-xs font-sans">
                {lang === 'az'
                  ? 'U.S. Şərq Sahili optimal TSP marşrut ardıcıllığını görmək üçün yuxarıdakı "Ardıcıllığı Optimizə Et" düyməsini klikləyin.'
                  : 'Click the "Optimize Route Order" button to view the shortest paths.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
