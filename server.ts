import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn('GEMINI_API_KEY environment variable is missing.');
  }
} catch (error) {
  console.error('Failed to initialize GoogleGenAI SDK:', error);
}

// API: Check system health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// API: Retrieve dynamic travel insights and recommendations in Azerbajian & English on demand
app.post('/api/suggest-places', async (req, res) => {
  const { places, dayName, lang = 'az' } = req.body;
  
  if (!ai) {
    return res.status(503).json({ 
      error: 'AI capability is currently unavailable. Please verify GEMINI_API_KEY in Secrets.' 
    });
  }

  const placesList = Array.isArray(places) ? places.join(', ') : 'this route';
  const queryLang = lang === 'az' ? 'Azerbaijani' : 'English';
  
  const prompt = `You are an expert travel assistant. The user wants recommendations for a day of their road trip called "${dayName || 'Day Trip'}" visiting: ${placesList}.
Provide 3 highly interesting points of interest or restaurants/eats exactly along this segment.
Keep your recommendations concise, immersive, and strictly helpful for non-technical family travellers.
Provide the output formatted in ${queryLang} language. Give each recommendation:
1. Name (Adı)
2. Type (Category, like Sight/Sights/Cafe)
3. Concise 2-sentence description of what to see/eat there.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    
    res.json({ text: response.text });
  } catch (err: any) {
    console.error('Gemini call error:', err);
    res.status(500).json({ error: err.message || 'Error running AI helper' });
  }
});

// Configure Vite middleware in development, or serve static files in production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting Vite dev server middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log(`Serving static production files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

setupServer().catch((error) => {
  console.error('Error launching full-stack server:', error);
});
