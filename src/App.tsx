import { useState, useMemo } from 'react';
import tripJson from './tripData.json';
import { TripData, TripSection, TripBlock, Language } from './types';
import { translations } from './utils';
import TripHeader from './components/TripHeader';
import MapComponent from './components/MapComponent';
import DayItinerary from './components/DayItinerary';
import LodgingsList from './components/LodgingsList';
import RouteOptimizer from './components/RouteOptimizer';
import AIAssistant from './components/AIAssistant';
import { Calendar, Home, Navigation, Sparkles, Map, Search, AlertCircle, RefreshCw } from 'lucide-react';

const tripData = tripJson as TripData;

export default function App() {
  const [lang, setLang] = useState<Language>('az');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'lodging' | 'optimizer' | 'ai'>('itinerary');
  
  // Hotel listings are grouped in section index 0
  const lodgingSection = useMemo(() => {
    return tripData.sections.find((s) => s.type === 'hotels') || tripData.sections[0];
  }, []);

  // Filter day-plans (sections mapping Day 1 to Day 38)
  const dayPlans = useMemo(() => {
    return tripData.sections.filter((s) => s.type !== 'hotels');
  }, []);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const activeDaySection = useMemo(() => {
    return dayPlans[selectedDayIndex] || dayPlans[0];
  }, [dayPlans, selectedDayIndex]);

  const [selectedPlace, setSelectedPlace] = useState<TripBlock | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapShowAll, setMapShowAll] = useState<boolean>(false);

  const dict = translations[lang];

  // Quick Search Filter: searches day titles or any place names inside them
  const filteredDays = useMemo(() => {
    if (!searchQuery.trim()) return dayPlans;
    const query = searchQuery.toLowerCase();
    return dayPlans.filter((s, idx) => {
      const headingMatch = s.heading.toLowerCase().includes(query);
      const placeMatch = s.blocks.some(
        (b) => b.name.toLowerCase().includes(query) || (b.address && b.address.toLowerCase().includes(query))
      );
      const dayNumMatch = `gün ${idx + 1}`.includes(query) || `day ${idx + 1}`.includes(query);
      return headingMatch || placeMatch || dayNumMatch;
    });
  }, [dayPlans, searchQuery]);

  const handleSelectDay = (globalIdx: number) => {
    // Find matching index in original dayPlans array
    const daySec = dayPlans[globalIdx];
    const originalIndex = dayPlans.indexOf(daySec);
    if (originalIndex !== -1) {
      setSelectedDayIndex(originalIndex);
      setSelectedPlace(null);
      setMapShowAll(false);
    }
  };

  const handleFocusPlace = (place: TripBlock) => {
    setSelectedPlace(place);
    setMapShowAll(false);
  };

  return (
    <div className="min-h-screen bg-brand-cream-light flex flex-col font-sans select-none antialiased text-brand-charcoal">
      {/* Localized Header bar */}
      <TripHeader
        currentLang={lang}
        onSetLang={setLang}
        startDate={tripData.startDate}
        endDate={tripData.endDate}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: List of Days and Search Engine (Takes 4 cols out of 12) */}
        <section className="lg:col-span-4 flex flex-col gap-5 h-fit lg:sticky lg:top-8 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
          
          {/* Quick Search Panel */}
          <div className="bg-white border border-brand-sand rounded-2xl p-4 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                placeholder={dict.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-cream-dark/50 hover:bg-brand-cream-dark/80 focus:bg-white text-xs font-medium border border-brand-sand rounded-xl outline-hidden focus:ring-2 focus:ring-brand-terracotta/20 transition-all font-sans text-brand-charcoal placeholder-brand-muted"
              />
            </div>
          </div>

          {/* Interactive Days Timeline Scroll Selector */}
          <div className="bg-white border border-brand-sand rounded-2xl overflow-hidden shadow-xs flex flex-col flex-1">
            <div className="px-5 py-4 border-b border-brand-sand bg-brand-cream-dark/30 flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-[#A67C52] tracking-wider font-mono">
                📅 {lang === 'az' ? 'GÜNLÜK MARŞRUTLAR' : 'DAYS CHRONOLOGY'}
              </span>
              <button
                onClick={() => {
                  setMapShowAll(true);
                  setSelectedPlace(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all border cursor-pointer ${
                  mapShowAll
                    ? 'bg-brand-terracotta text-white border-brand-terracotta shadow-xs'
                    : 'bg-white text-brand-charcoal border-brand-sand hover:bg-brand-cream-dark'
                }`}
                id="btn-show-all-map"
              >
                <Map className="w-3.5 h-3.5" />
                {dict.viewAllMap}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] lg:max-h-[500px]">
              {filteredDays.length === 0 ? (
                <div className="py-12 text-center text-brand-muted text-xs px-4">
                  <AlertCircle className="w-8 h-8 stroke-1 text-brand-sand mx-auto mb-2" />
                  {lang === 'az'
                    ? 'Axtarışınıza uyğun heç bir gəzinti günü tapılmadı.'
                    : 'No itinerary days match your keywords.'}
                </div>
              ) : (
                <div className="divide-y divide-brand-sand/65">
                  {filteredDays.map((day) => {
                    // Find actual day index relative to original list
                    const originalIdx = dayPlans.indexOf(day);
                    const isSelected = !mapShowAll && originalIdx === selectedDayIndex;
                    const placeCount = day.blocks.filter((b) => b.type === 'place').length;

                    return (
                      <button
                        key={day.id}
                        onClick={() => handleSelectDay(originalIdx)}
                        className={`w-full text-left p-4 flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-cream-dark/50 border-l-4 border-brand-terracotta'
                            : 'hover:bg-brand-cream-dark/20'
                        }`}
                        id={`day-select-btn-${day.id}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 font-mono transition-colors ${
                            isSelected
                              ? 'bg-brand-terracotta text-white shadow-xs'
                              : 'bg-brand-cream-dark text-brand-muted'
                          }`}
                        >
                          <span className="text-[9px] uppercase tracking-wider font-extrabold">
                            {lang === 'az' ? 'GÜN' : 'DAY'}
                          </span>
                          <span className="text-sm font-black -mt-1">{originalIdx + 1}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-brand-charcoal truncate font-sans">
                            {day.heading || (lang === 'az' ? 'Yolüstü Keçid' : 'Driving Segment')}
                          </h4>
                          <p className="text-[10px] text-brand-muted mt-0.5 font-mono">
                            {placeCount > 0
                              ? `${placeCount} ${lang === 'az' ? 'ziyarət nöqtəsi' : 'sight points'}`
                              : lang === 'az' ? 'Yolüstü istirahət / sürüş' : 'No active highlights'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Active Day detail, map, tabs (Takes 8 cols out of 12) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* MAP DISPLAY PANEL */}
          <div className="h-[300px] md:h-[450px] w-full shrink-0">
            <MapComponent
              items={activeDaySection.blocks}
              activeItem={selectedPlace}
              showAll={mapShowAll}
              allSections={dayPlans}
              lang={lang}
            />
          </div>

          {/* INNER INTERACTIVE TABS BAR */}
          <div className="flex items-center gap-2 p-1 bg-brand-cream-dark border border-brand-sand rounded-2xl">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all font-sans cursor-pointer ${
                activeTab === 'itinerary'
                  ? 'bg-white text-brand-terracotta shadow-xs border border-brand-sand'
                  : 'text-brand-muted hover:text-brand-charcoal border border-transparent'
              }`}
              id="tab-select-itinerary"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{dict.dayPlanTitle}</span>
            </button>

            <button
              onClick={() => setActiveTab('lodging')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all font-sans cursor-pointer ${
                activeTab === 'lodging'
                  ? 'bg-white text-brand-terracotta shadow-xs border border-brand-sand'
                  : 'text-brand-muted hover:text-brand-charcoal border border-transparent'
              }`}
              id="tab-select-lodging"
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>{dict.lodgingTitle}</span>
            </button>

            <button
              onClick={() => setActiveTab('optimizer')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all font-sans cursor-pointer ${
                activeTab === 'optimizer'
                  ? 'bg-white text-brand-terracotta shadow-xs border border-brand-sand'
                  : 'text-brand-muted hover:text-brand-charcoal border border-transparent'
              }`}
              id="tab-select-optimizer"
            >
              <Navigation className="w-4 h-4 shrink-0" />
              <span>{dict.optimizerTitle}</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all font-sans cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-white text-brand-terracotta shadow-xs border border-brand-sand'
                  : 'text-brand-muted hover:text-brand-charcoal border border-transparent'
              }`}
              id="tab-select-ai"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{dict.aiTitle}</span>
            </button>
          </div>

          {/* TAB CONTENTS CONTAINER */}
          <div className="bg-transparent rounded-2xl transition-all">
            {activeTab === 'itinerary' && (
              <DayItinerary
                section={activeDaySection}
                lang={lang}
                onSelectPlace={handleFocusPlace}
                activePlace={selectedPlace}
                dayNumber={selectedDayIndex + 1}
              />
            )}

            {activeTab === 'lodging' && (
              <LodgingsList
                section={lodgingSection}
                lang={lang}
                onSelectPlace={handleFocusPlace}
              />
            )}

            {activeTab === 'optimizer' && (
              <RouteOptimizer
                section={activeDaySection}
                lang={lang}
              />
            )}

            {activeTab === 'ai' && (
              <AIAssistant
                dayName={activeDaySection.heading || `${lang === 'az' ? 'Mərhələ' : 'Segment'} #${selectedDayIndex + 1}`}
                places={activeDaySection.blocks}
                lang={lang}
              />
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
