import { TripBlock, TranslationDict, Language } from './types';

// Haversine formula to compute geodesic distance on our planet
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute the sum of a sequence of spots in kilometers
export function computeTotalPathDistance(blocks: TripBlock[]): number {
  let distance = 0;
  let previous: TripBlock | null = null;
  for (const b of blocks) {
    if (b.lat !== undefined && b.lng !== undefined) {
      if (previous && previous.lat !== undefined && previous.lng !== undefined) {
        distance += getDistanceKm(previous.lat, previous.lng, b.lat, b.lng);
      }
      previous = b;
    }
  }
  return distance;
}

// Full Traveling Salesperson permutations for under 8 nodes
export function optimizeRouteOrder(blocks: TripBlock[]): TripBlock[] {
  const placeBlocks = blocks.filter((b) => b.type === 'place' && b.lat !== undefined && b.lng !== undefined);
  const otherBlocks = blocks.filter((b) => b.type !== 'place' || b.lat === undefined || b.lng === undefined);
  
  if (placeBlocks.length <= 2) {
    return blocks; // Optimization not required for 1 or 2 spots
  }

  // We will solve TSP starting from the first block (index 0), as it's the anchor start (e.g. hotel)
  const startNode = placeBlocks[0];
  const itemsToPermute = placeBlocks.slice(1);

  let bestSequence: TripBlock[] = [];
  let minDistance = Infinity;

  // Let's generate all permutations of indices 1..count-1
  const permute = (arr: TripBlock[]): TripBlock[][] => {
    const result: TripBlock[][] = [];
    const helper = (current: TripBlock[], remaining: TripBlock[]) => {
      if (remaining.length === 0) {
        result.push(current);
        return;
      }
      for (let i = 0; i < remaining.length; i++) {
        helper([...current, remaining[i]], [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
      }
    };
    helper([], arr);
    return result;
  };

  const allPermutations = permute(itemsToPermute);

  for (const perm of allPermutations) {
    const candidateSequence = [startNode, ...perm];
    const dist = computeTotalPathDistance(candidateSequence);
    if (dist < minDistance) {
      minDistance = dist;
      bestSequence = candidateSequence;
    }
  }

  // Append any non-place blocks (like notes or text) to the end of our listing, or keep original position
  return [...bestSequence, ...otherBlocks];
}

// Translation dictionaries for English and Azerbaijani
export const translations: Record<Language, TranslationDict> = {
  az: {
    title: "Yay 2026: ABŞ Şərq Sahili Səyahəti",
    subtitle: "Nəqliyyat marşrutları, otellər, xəritələr və süni zəka tövsiyələri ilə ailəvi və dostlar üçün interaktiv gəzinti bələdçisi.",
    viewAllMap: "Bütün Yerlər",
    lodgingTitle: "Otellər & Yerləşmə",
    hotelsTitle: "Səyahət Boyu Qalacağımız Otellər",
    dayPlanTitle: "Günlük Marşrutlar",
    optimizerTitle: "Səyahət Optimizatoru",
    aiTitle: "Ağıllı Süni Zəka Bələdçisi",
    daysLabel: "Gün",
    dateLabel: "Tarix",
    addressLabel: "Ünvan",
    noteLabel: "Vacib Qeyd",
    directionsBtn: "Google Xəritədə Bax",
    optimizeBtn: "Ardıcıllığı Optimizə Et",
    optimizedOrderLabel: "Riyazi Optimal Ardıcıllıq (TSP)",
    originalOrderLabel: "İlkin Ardıcıllıq",
    totalDistanceLabel: "Ümumi Yol Məsafəsi",
    recommendLabel: "Ailəmiz üçün tövsiyə olunan yolüstü gəzməli məkanlar:",
    noCoordsError: "Bu gündə xəritə koordinatları olan yer yoxdur.",
    loadingAi: "Süni Zəka marşrutuna uyğun maraqlı məkanları təhlil edir...",
    aiPlaceholder: "Bu günlük səyahət planı üzrə görməli yerləri və milli Azərbaycan mətbəxinə yaxın dadları öyrənmək üçün 'Süni Zəkadan Sorun' düyməsinə klikləyin.",
    roadtripOverview: "Səyahətə Ümumi Baxış",
    searchPlaceholder: "Bölgə və ya şəhər adı axtarın...",
    recommendedPlacesOnWayTitle: "Yaxınlıqdakı Populyar Görməli Yerlər (Tövsiyə)"
  },
  en: {
    title: "Summer 2026 U.S. East Coast Road Trip",
    subtitle: "An interactive, friendly travel guide for family and friends with maps, routes, lodging plans, and smart AI insights.",
    viewAllMap: "All Locations",
    lodgingTitle: "Hotels & Lodgings",
    hotelsTitle: "Lodgings List Across the Journey",
    dayPlanTitle: "Day Itineraries",
    optimizerTitle: "Route Optimizer",
    aiTitle: "Smart AI Explorer",
    daysLabel: "Day",
    dateLabel: "Date",
    addressLabel: "Address",
    noteLabel: "Important Note",
    directionsBtn: "View on Google Maps",
    optimizeBtn: "Optimize Route Order",
    optimizedOrderLabel: "Mathematically Optimized Order (TSP)",
    originalOrderLabel: "Original Order",
    totalDistanceLabel: "Total Segment Distance",
    recommendLabel: "Recommended must-see places on the way:",
    noCoordsError: "No map coordinates found for this segment.",
    loadingAi: "AI is analyzing the route and finding spectacular eats...",
    aiPlaceholder: "Click the 'Ask AI' button above to request highly personalized roadside sights and local restaurant recommendations for this trip segment.",
    roadtripOverview: "Road Trip Overview",
    searchPlaceholder: "Search regions, stops, or cities...",
    recommendedPlacesOnWayTitle: "Popular Nearby Places to See (Offline Preset)"
  }
};

// Static worth-to-see recommendations based on day segments to make it offline-friendly
export const getOfflineRecommendations = (heading: string, lang: Language): { name: string; desc: string }[] => {
  const isAz = lang === 'az';
  const h = heading.toLowerCase();

  if (h.includes('new york') || h.includes('times square') || h.includes('dumbo')) {
    return [
      {
        name: isAz ? "The High Line Parkı" : "The High Line Park",
        desc: isAz 
          ? "Manhattanın qərbində yerləşən köhnə dəmiryol xətti üzərində qurulmuş ecazkar asma bağça."
          : "An elevated historic freight rail line transformed into a public park on Manhattan's West Side."
      },
      {
        name: isAz ? "DUMBO və Bruklin Körpüsü" : "DUMBO & Brooklyn Bridge",
        desc: isAz
          ? "Manhattanın möhtəşəm şəkillərini çəkmək və parkda dolanmaq üçün mükəmməl sahilboyu gəzinti zonası."
          : "Cobblestone streets and beautiful waterfront views, ideal for taking iconic skyline photos."
      },
      {
        name: isAz ? "Chelsea Market Mall" : "Chelsea Market",
        desc: isAz
          ? "Dünyanın hər yerindən mükəmməl küçə yeməkləri və sənətkar butikləri ilə məşhur örtülü bazar."
          : "Famous indoor food court and markets featuring international cuisines and local craft shops."
      }
    ];
  }

  if (h.includes('boston') || h.includes('harvard') || h.includes('mit')) {
    return [
      {
        name: isAz ? "Freedom Trail (Azadlıq Cığırı)" : "The Freedom Trail",
        desc: isAz
          ? "Şəhərin tarixi milli binalarını birləşdirən və yerdəki qırmızı kərpiclərlə nişanlanmış 4 km-lik gəzinti yolu."
          : "A 2.5-mile path leading to 16 historic sites, perfect for learning about US Revolutionary history."
      },
      {
        name: isAz ? "Quincy Market Bazar" : "Quincy Market & Faneuil Hall",
        desc: isAz
          ? "Əfsanəvi Boston lobya bulyonu (Clam Chowder) və yerli lobster sendviçlərini dadmaq üçün qədim yemək salonu."
          : "Historic market filled with food stalls, crafts, and famous New England clam chowders."
      }
    ];
  }

  if (h.includes('niagara') || h.includes('maid of the mist')) {
    return [
      {
        name: isAz ? "Goat Adası (Keçi Adası)" : "Goat Island",
        desc: isAz
          ? "Niagara Şəlaləsinin düz ortasında yerləşən, şəlalə pərdəsinin dibinə gedən Cave of the Winds giriş nöqtəsi."
          : "Located in the middle of Niagara Falls, providing dramatic up-close views and Cave of the Winds trail access."
      },
      {
        name: isAz ? "Whirlpool Dövlət Parkı" : "Whirlpool State Park",
        desc: isAz
          ? "Şəlalədən bir qədər aşağıda, suyun nəhəng burulğan və dərələr əmələ gətirdiyi gözoxşayan mənzərə nöqtəsi."
          : "Overlooking the swirling Niagara River giant whirlpool pools, offering scenic hiking and viewpoints."
      }
    ];
  }

  if (h.includes('acadia') || h.includes('portland') || h.includes('maine') || h.includes('jordan pond')) {
    return [
      {
        name: isAz ? "Cadillac Dağı Zirvəsi" : "Cadillac Mountain Summit",
        desc: isAz
          ? "Şimali Amerikada günəşin ilk şəfəqlərini doğurduğu, Acadia parkının ən yüksək möhtəşəm dəniz mənzərəli zirvəsi."
          : "The highest point on the North Atlantic seaboard, famous for catching the first US sunrise."
      },
      {
        name: isAz ? "Thunder Hole (Gürültülü Yarğan)" : "Thunder Hole",
        desc: isAz
          ? "Sahildəki qayalar arasına sıxışan güclü dalğaların göy gurultusuna bənzər nəhəng su püskürtüləri asıldığı yer."
          : "A small rocky inlet where crashing ocean waves are forced into caves, creating spectacular booming sounds."
      }
    ];
  }

  if (h.includes('towson') || h.includes('baltimore') || h.includes('southerly')) {
    return [
      {
        name: isAz ? "Baltimore Inner Harbor Sahili" : "Baltimore Inner Harbor",
        desc: isAz
          ? "Sahildə gəzinti barları, nəhəng Akvarium kompleksi və tarixi ABŞ Constellation gəmisi yerləşən gəzinti qovşağı."
          : "Beautiful historic seaport and tourist area offering amazing dining, museums, and historic ships."
      },
      {
        name: isAz ? "Fort McHenry Milli Abidəsi" : "Fort McHenry National Monument",
        desc: isAz
          ? "ABŞ milli himninin (Star-Spangled Banner) yazılmasına ilham vermiş 1812-ci il müharibəsinin məşhur ulduz qalası."
          : "The famous star-shaped fort that defended Baltimore during the War of 1812, inspiring the national anthem."
      }
    ];
  }

  // General fallback recommendations
  return [
    {
      name: isAz ? "Milli Park Cığırı və Piknik" : "National Park Walks & Picnic",
      desc: isAz
        ? "Yolboyu yerli ağaclardan, meşə parklarından və ailəvi istirahət üçün təmiz havalı oturacaqlardan yararlanın."
        : "Immerse yourself in clean regional pine forests, wooden trail networks, and tranquil family picnic spots."
    },
    {
      name: isAz ? "Yerli Restoran və Mətbəxlər" : "Regional Roadside Diners & Eateries",
      desc: isAz
        ? "Bölgənin özünəməxsus qədim üslublu kənar yeməkxanalarını tapın və yerli şirniyyatları rəğbətlə dadın."
        : "Experience classic American roadside diners with authentic regional apple pies and homemade recipes."
    }
  ];
};
