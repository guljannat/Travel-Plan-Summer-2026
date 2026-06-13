import https from 'https';
import fs from 'fs';
import path from 'path';

const url = 'https://wanderlog.com/view/sslcqtfhlz/trip-to-the-united-states/shared';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const mobxIndex = data.indexOf('window.__MOBX_STATE__ = ');
    if (mobxIndex === -1) {
      console.error('window.__MOBX_STATE__ not found');
      process.exit(1);
    }
    
    const startOfJson = mobxIndex + 'window.__MOBX_STATE__ = '.length;
    const endOfLineIndex = data.indexOf(';\n', startOfJson);
    let jsonStr = '';
    if (endOfLineIndex !== -1) {
      jsonStr = data.slice(startOfJson, endOfLineIndex);
    } else {
      const nextSemi = data.indexOf(';', startOfJson);
      jsonStr = data.slice(startOfJson, nextSemi);
    }
    
    try {
      const state = JSON.parse(jsonStr);
      const tpStore = state.tripPlanStore?.data;
      const tp = tpStore?.tripPlan;
      if (!tp) {
        console.error('No tripPlan found in state');
        process.exit(1);
      }
      
      const title = tp.title || "Summer 2026 Trip to the U.S. East Coast";
      const startDate = tp.startDate || "2026-07-14";
      const endDate = tp.endDate || "2026-08-20";
      const rawSections = tp.itinerary?.sections || [];
      const placeMetadata = tpStore.resources?.placeMetadata || {};
      
      console.log(`Extracting ${rawSections.length} sections...`);
      
      const sections = rawSections.map((s: any, secIdx: number) => {
        // Extract blocks
        const blocks = (s.blocks || []).map((b: any) => {
          let name = b.name || b.title || '';
          let lat: number | undefined = undefined;
          let lng: number | undefined = undefined;
          let address = '';
          let description = '';
          let googleUrl = '';
          let metadataId: number | undefined = undefined;
          let photoUrls: string[] = [];
          
          if (b.place) {
            name = b.place.name || name;
            lat = b.place.geometry?.location?.lat;
            lng = b.place.geometry?.location?.lng;
            address = b.place.formatted_address || '';
            googleUrl = b.place.url || '';
            photoUrls = b.place.photo_urls || [];
          }
          
          // Fallback to placeMetadata if available
          const placeId = b.place?.place_id;
          if (placeId) {
            // Find metadata with same placeId
            const meta = Object.values(placeMetadata).find((m: any) => m.placeId === placeId) as any;
            if (meta) {
              description = meta.generatedDescription || meta.description || description;
              metadataId = meta.id;
            }
          }
          
          // Extract text note content if any
          let noteText = '';
          if (b.text && b.text.ops) {
            noteText = b.text.ops.map((op: any) => op.insert || '').join('');
          } else if (typeof b.text === 'string') {
            noteText = b.text;
          }
          
          return {
            id: b.id,
            type: b.type, // 'place', 'note', etc.
            name,
            note: noteText.trim(),
            lat,
            lng,
            address,
            description,
            googleUrl,
            photoUrls,
            travelMode: b.travelMode || null,
          };
        });
        
        return {
          id: s.id,
          heading: s.heading || '',
          type: s.type, // 'hotels', 'normal', etc.
          mode: s.mode, // 'placeList', 'dayPlan'
          blocks,
        };
      });
      
      const compiledData = {
        title,
        startDate,
        endDate,
        sections,
      };
      
      const targetPath = path.resolve(process.cwd(), 'src', 'tripData.json');
      fs.writeFileSync(targetPath, JSON.stringify(compiledData, null, 2));
      console.log(`Successfully compiled trip details into ${targetPath}. Total sections: ${sections.length}`);
      
    } catch (e: any) {
      console.error('Error during data compilation:', e.stack);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
  process.exit(1);
});
