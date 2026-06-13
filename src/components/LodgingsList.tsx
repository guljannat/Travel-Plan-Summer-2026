import { TripSection, TripBlock, Language } from '../types';
import { translations } from '../utils';
import { Home, Phone, MapPin, Compass, Image as ImageIcon } from 'lucide-react';

interface LodgingsListProps {
  section: TripSection;
  lang: Language;
  onSelectPlace: (place: TripBlock) => void;
}

export default function LodgingsList({
  section,
  lang,
  onSelectPlace,
}: LodgingsListProps) {
  const dict = translations[lang];

  // Exclude duplicate residential spots like 900 Southerly Rd to display original hotels clearly
  const uniqueHotels = section.blocks.filter((b, index, self) =>
    self.findIndex((item) => item.name === b.name) === index
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-brand-cream-dark/40 border border-brand-sand rounded-2xl p-6">
        <h2 className="text-xl font-serif font-black text-brand-charcoal flex items-center gap-2">
          <Home className="w-5 h-5 text-brand-terracotta" />
          {dict.hotelsTitle}
        </h2>
        <p className="text-brand-muted text-sm mt-1 leading-relaxed">
          {lang === 'az'
            ? 'Şərq sahili boyunca qalacağımız, ailəvi və dostlara uyğun bütün otellərin siyahısı və daxili mənzərələri.'
            : 'List and photos of all pre-booked family hotels and local vacation stays across our road trip routing.'}
        </p>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueHotels.map((b) => {
          const hasPhotos = b.photoUrls && b.photoUrls.length > 0;
          return (
            <div
              key={b.id}
              className="bg-white border border-brand-sand rounded-2xl overflow-hidden hover:shadow-xs transition-all flex flex-col group"
            >
              {/* Hotel Photo Cover */}
              <div className="relative h-48 bg-brand-cream-dark/50 overflow-hidden">
                {hasPhotos ? (
                  <img
                    src={b.photoUrls[0]}
                    alt={b.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-brand-muted">
                    <ImageIcon className="w-8 h-8 stroke-1 text-brand-sand mb-1" />
                    <span className="text-xs font-mono">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-brand-charcoal/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {b.address.includes('NY') ? 'New York' : b.address.includes('MA') ? 'Massachusetts' : b.address.includes('NJ') ? 'New Jersey' : 'Maryland'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-brand-charcoal group-hover:text-brand-terracotta transition-colors line-clamp-2">
                    {b.name}
                  </h3>
                  
                  {b.address && (
                    <p className="text-xs text-brand-muted flex items-start gap-1.5 mt-2.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-brand-muted/75 shrink-0 mt-0.5" />
                      <span>{b.address}</span>
                    </p>
                  )}

                  {b.description && (
                    <p className="text-xs text-brand-charcoal mt-3 bg-brand-cream-dark/30 border border-brand-sand rounded-lg p-2.5 line-clamp-3 leading-relaxed">
                      {b.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-brand-sand flex items-center gap-2">
                  <button
                    onClick={() => onSelectPlace(b)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-brand-terracotta/10 hover:bg-brand-terracotta/18 text-brand-terracotta text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                    id={`hotel-focus-${b.id}`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    {lang === 'az' ? 'Xəritədə Fokusla' : 'Focus on Map'}
                  </button>
                  <a
                    href={b.googleUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name)}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex items-center justify-center bg-white hover:bg-brand-cream-dark text-brand-charcoal font-bold p-2.5 rounded-xl transition-all border border-brand-sand cursor-pointer shadow-2xs"
                    title={dict.directionsBtn}
                  >
                    <MapPin className="w-4 h-4 text-brand-muted" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
