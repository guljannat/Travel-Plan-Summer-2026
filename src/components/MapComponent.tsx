import { useEffect, useRef, useState } from 'react';
import { TripBlock, TripSection } from '../types';

interface MapComponentProps {
  items: TripBlock[];
  activeItem?: TripBlock | null;
  showAll?: boolean;
  allSections?: TripSection[];
  lang?: 'az' | 'en';
}

export default function MapComponent({
  items,
  activeItem,
  showAll = false,
  allSections = [],
  lang = 'az',
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // 1. Dynamically load Leaflet library from CDN
  useEffect(() => {
    if ((window as any).L) {
      setIsLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    cssLink.crossOrigin = '';
    document.head.appendChild(cssLink);

    const jsScript = document.createElement('script');
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    jsScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    jsScript.crossOrigin = '';
    document.body.appendChild(jsScript);

    jsScript.onload = () => {
      setIsLeafletLoaded(true);
    };

    return () => {
      // Don't remove script/css to prevent reload flashing, they are safe to stay global
    };
  }, []);

  // 2. Initialize Map instance
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current) return;

    // Remove existing maps if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Set up Baltimore, MD center as default
    const defaultCenter = [40.0, -75.5];
    const L = (window as any).L;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      zoomSnap: 0.5,
    }).setView(defaultCenter, 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletLoaded]);

  // 3. Draw markers, polylines and fly map focus
  useEffect(() => {
    if (!isLeafletLoaded || !mapInstanceRef.current) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Clear previous polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    let latlngs: any[] = [];
    const validPlaces: { block: TripBlock; lat: number; lng: number }[] = [];

    if (showAll) {
      // Render all sections
      let counter = 1;
      allSections.forEach((sec) => {
        const isHotelList = sec.type === 'hotels';
        sec.blocks.forEach((b) => {
          if (b.type === 'place' && b.lat !== undefined && b.lng !== undefined) {
            validPlaces.push({ block: b, lat: b.lat, lng: b.lng });
          }
        });
      });
    } else {
      // Render places for the active day / list
      items.forEach((b) => {
        if (b.type === 'place' && b.lat !== undefined && b.lng !== undefined) {
          validPlaces.push({ block: b, lat: b.lat, lng: b.lng });
        }
      });
    }
    // Draw markers
    validPlaces.forEach((item, idx) => {
      const isSelected = activeItem && activeItem.id === item.block.id;
      const markerColor = isSelected ? '#A67C52' : showAll ? '#8C8479' : '#7E8C76';
      const indicatorNum = (idx + 1).toString();

      // Premium Custom HTML Marker pinned via Tailwind CSS and SVG
      const markerHtml = `
        <div class="flex flex-col items-center">
          <div class="flex items-center justify-center shadow-md rounded-full border-2 border-white text-white font-bold text-xs"
               style="background-color: ${markerColor}; width: 28px; height: 28px; font-family: var(--font-sans, sans-serif);">
            ${indicatorNum}
          </div>
          <!-- Tiny bottom triangle indicator -->
          <div class="w-2 h-2 rotate-45 -mt-1 shadow-sm border-r border-b border-white"
               style="background-color: ${markerColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [28, 36],
        iconAnchor: [14, 34],
        popupAnchor: [0, -32],
      });

      const clickDirectionsText = lang === 'az' ? 'Xəritədə bax (Google Maps)' : 'Directions (Google Maps)';
      const popupText = `
        <div class="min-w-[170px] text-[#4A443F] p-1 font-sans">
          <p class="font-serif font-black text-sm mb-0" style="color: #4A443F; font-size: 13px;">${item.block.name}</p>
          <p class="text-[11px] text-[#8C8479] mt-1 mb-1 line-clamp-2">${item.block.address || ''}</p>
          ${item.block.note ? `<p class="text-[10px] bg-[#F4F1EA] text-[#4A443F] p-1.5 rounded font-medium border border-[#E8E2D9] mt-1.5 mb-1">📝 ${item.block.note}</p>` : ''}
          <a href="${item.block.googleUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.block.name)}`}" 
             target="_blank" 
             referrerPolicy="no-referrer"
             class="block text-center text-[10px] mt-2 bg-[#A67C52] hover:bg-[#8F6A43] text-white font-bold py-1.5 px-2 rounded no-underline tracking-wide uppercase transition-colors">
            ${clickDirectionsText} ↗
          </a>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon: customIcon })
        .bindPopup(popupText)
        .addTo(map);

      // Attach special hover highlight
      marker.on('click', () => {
        marker.openPopup();
      });

      markersRef.current.push(marker);
      latlngs.push([item.lat, item.lng]);
    });

    // Draw connection lines representing route flow
    if (latlngs.length > 1 && !showAll) {
      const routePolyline = L.polyline(latlngs, {
        color: '#A67C52',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8', // elegant dashed effect showing transport paths
      }).addTo(map);

      polylineRef.current = routePolyline;
    }

    // Auto-focus around markers bounds cleanly
    if (latlngs.length > 0) {
      if (activeItem && activeItem.lat !== undefined && activeItem.lng !== undefined) {
        // Smooth transit focus animation on the chosen place
        map.flyTo([activeItem.lat, activeItem.lng], 13, { duration: 1.2 });
        // Find corresponding marker and auto open popup
        const selectedMarkerIdx = validPlaces.findIndex((item) => item.block.id === activeItem.id);
        if (selectedMarkerIdx !== -1) {
          setTimeout(() => {
            markersRef.current[selectedMarkerIdx].openPopup();
          }, 300);
        }
      } else {
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [items, activeItem, showAll, allSections, isLeafletLoaded, lang]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-brand-sand shadow-xs">
      <div id="map-container" ref={mapContainerRef} className="w-full h-full bg-[#F4F1EA] min-h-[300px] md:min-h-[450px]" />
      
      {/* Dynamic Leaflet Loading Screen */}
      {!isLeafletLoaded && (
        <div className="absolute inset-0 bg-brand-cream-light flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-brand-charcoal font-medium font-mono text-center">
            {lang === 'az' ? 'İnteraktiv Xəritə Yüklənir...' : 'Loading Interactive Maps...'}
          </p>
        </div>
      )}
    </div>
  );
}
