import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import https from 'https';

// Built-in Vite Server Middleware that streams real Native Neural Audio without browser CORS/Referer blocks
function veraNeuralTtsProxy() {
  return {
    name: 'vera-neural-tts-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/tts', (req: any, res: any) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          const tl = urlObj.searchParams.get('tl') || 'es';
          const q = urlObj.searchParams.get('q') || '';
          if (!q) {
            res.statusCode = 400;
            res.end('Missing text');
            return;
          }
          const targetUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(q.slice(0, 200))}`;
          https.get(
            targetUrl,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
              }
            },
            (upstream) => {
              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              upstream.pipe(res);
            }
          ).on('error', () => {
            res.statusCode = 502;
            res.end();
          });
        } catch {
          res.statusCode = 500;
          res.end();
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';

  return {
    plugins: [
      tailwindcss(),
      react(),
      veraNeuralTtsProxy()
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env': {}
    },
    server: {
      port: 3000,
      host: '0.0.0.0'
    },
    build: {
      chunkSizeWarningLimit: 2000
    }
  };
});
