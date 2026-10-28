import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import https from 'https';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const WebSocket = require('ws');

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const EDGE_VERSION = '1-131.0.2903.86';
const ttsAudioCache = new Map<string, Buffer>();

function generateSecMsGec(): string {
  const winEpoch = 11644473600;
  let ticks = Math.floor(Date.now() / 1000) + winEpoch;
  ticks -= ticks % 300;
  const ticks100ns = BigInt(ticks) * 10000000n;
  const strToHash = `${ticks100ns.toString()}${TRUSTED_CLIENT_TOKEN}`;
  return crypto.createHash('sha256').update(strToHash, 'ascii').digest('hex').toUpperCase();
}

function resolveNativeHumanVoice(
  tl: string,
  gender: string,
  personaId: string
): { voice: string; lang: string; rate: string; pitch: string } {
  const p = (personaId || '').toLowerCase();
  const isFemale = (gender || '').toLowerCase() === 'female';

  if (p.includes('badr')) return { voice: 'ar-MA-JamalNeural', lang: 'ar-MA', rate: '+2%', pitch: '+0Hz' };
  if (p.includes('malika')) return { voice: 'ar-MA-MounaNeural', lang: 'ar-MA', rate: '+0%', pitch: '+0Hz' };
  if (p.includes('youssef')) return { voice: 'ar-DZ-IsmaelNeural', lang: 'ar-DZ', rate: '+2%', pitch: '-2Hz' };
  if (p.includes('zineb')) return { voice: 'ar-TN-ReemNeural', lang: 'ar-TN', rate: '+2%', pitch: '+3Hz' };

  if (p.includes('karim')) return { voice: 'ar-EG-ShakirNeural', lang: 'ar-EG', rate: '+2%', pitch: '+0Hz' };
  if (p.includes('nour')) return { voice: 'ar-EG-SalmaNeural', lang: 'ar-EG', rate: '+0%', pitch: '+0Hz' };
  if (p.includes('tarek')) return { voice: 'ar-EG-ShakirNeural', lang: 'ar-EG', rate: '+5%', pitch: '-3Hz' };

  if (p.includes('sofia')) return { voice: 'es-MX-DaliaNeural', lang: 'es-MX', rate: '+2%', pitch: '+0Hz' };
  if (p.includes('diego')) return { voice: 'es-MX-JorgeNeural', lang: 'es-MX', rate: '+2%', pitch: '+0Hz' };

  if (p.includes('mateo')) return { voice: 'es-CO-GonzaloNeural', lang: 'es-CO', rate: '+2%', pitch: '+0Hz' };
  if (p.includes('valentina')) return { voice: 'es-CO-SalomeNeural', lang: 'es-CO', rate: '+2%', pitch: '+0Hz' };

  if (p.includes('camille')) return { voice: 'fr-FR-DeniseNeural', lang: 'fr-FR', rate: '+2%', pitch: '+0Hz' };
  if (p.includes('lucas_montmartre')) return { voice: 'fr-FR-HenriNeural', lang: 'fr-FR', rate: '+2%', pitch: '+0Hz' };

  if (p.includes('kenji')) return { voice: 'ja-JP-KeitaNeural', lang: 'ja-JP', rate: '+0%', pitch: '+0Hz' };
  if (p.includes('haruka')) return { voice: 'ja-JP-NanamiNeural', lang: 'ja-JP', rate: '+0%', pitch: '+0Hz' };

  if (p.includes('lucas_rio')) return { voice: 'pt-BR-AntonioNeural', lang: 'pt-BR', rate: '+2%', pitch: '+0Hz' };
  if (p.includes('gabriela')) return { voice: 'pt-BR-FranciscaNeural', lang: 'pt-BR', rate: '+2%', pitch: '+0Hz' };

  const lang = (tl || 'es-MX').toLowerCase();
  if (lang.startsWith('ar-ma')) return { voice: isFemale ? 'ar-MA-MounaNeural' : 'ar-MA-JamalNeural', lang: 'ar-MA', rate: '+0%', pitch: '+0Hz' };
  if (lang.startsWith('ar')) return { voice: isFemale ? 'ar-EG-SalmaNeural' : 'ar-EG-ShakirNeural', lang: 'ar-EG', rate: '+0%', pitch: '+0Hz' };
  if (lang.startsWith('es-co')) return { voice: isFemale ? 'es-CO-SalomeNeural' : 'es-CO-GonzaloNeural', lang: 'es-CO', rate: '+0%', pitch: '+0Hz' };
  if (lang.startsWith('es')) return { voice: isFemale ? 'es-MX-DaliaNeural' : 'es-MX-JorgeNeural', lang: 'es-MX', rate: '+0%', pitch: '+0Hz' };
  if (lang.startsWith('fr')) return { voice: isFemale ? 'fr-FR-DeniseNeural' : 'fr-FR-HenriNeural', lang: 'fr-FR', rate: '+0%', pitch: '+0Hz' };
  if (lang.startsWith('ja')) return { voice: isFemale ? 'ja-JP-NanamiNeural' : 'ja-JP-KeitaNeural', lang: 'ja-JP', rate: '+0%', pitch: '+0Hz' };
  if (lang.startsWith('pt')) return { voice: isFemale ? 'pt-BR-FranciscaNeural' : 'pt-BR-AntonioNeural', lang: 'pt-BR', rate: '+0%', pitch: '+0Hz' };

  return { voice: isFemale ? 'es-MX-DaliaNeural' : 'es-MX-JorgeNeural', lang: 'es-MX', rate: '+0%', pitch: '+0Hz' };
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function synthesizeNativeNeuralMp3(
  text: string,
  voiceInfo: { voice: string; lang: string; rate: string; pitch: string }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const connectId = crypto.randomUUID().replace(/-/g, '');
    const secMsGec = generateSecMsGec();
    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${EDGE_VERSION}&ConnectionId=${connectId}`;

    const ws = new WebSocket(wsUrl, {
      headers: {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
      }
    });

    const audioChunks: Buffer[] = [];
    const timeout = setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error('Neural TTS timeout'));
    }, 7000);

    ws.on('open', () => {
      const configMsg =
        `X-Timestamp:${new Date().toUTCString()}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'false' },
                outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
              }
            }
          }
        });
      ws.send(configMsg);

      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${voiceInfo.lang}'>` +
        `<voice name='${voiceInfo.voice}'>` +
        `<prosody pitch='${voiceInfo.pitch}' rate='${voiceInfo.rate}' volume='+0%'>${escapeXml(text)}</prosody>` +
        `</voice></speak>`;

      const ssmlMsg =
        `X-RequestId:${connectId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${new Date().toUTCString()}Z\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml;
      ws.send(ssmlMsg);
    });

    ws.on('message', (data: Buffer, isBinary: boolean) => {
      if (isBinary) {
        const separator = Buffer.from('Path:audio\r\n');
        const idx = data.indexOf(separator);
        if (idx !== -1) {
          audioChunks.push(data.subarray(idx + separator.length));
        }
      } else {
        const msgStr = data.toString('utf8');
        if (msgStr.includes('Path:turn.end')) {
          clearTimeout(timeout);
          try { ws.close(); } catch {}
          if (audioChunks.length > 0) {
            resolve(Buffer.concat(audioChunks));
          } else {
            reject(new Error('Empty audio stream'));
          }
        }
      }
    });

    ws.on('error', (err: any) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function veraNeuralTtsProxy() {
  return {
    name: 'vera-neural-tts-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/tts', async (req: any, res: any) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          const tl = urlObj.searchParams.get('tl') || 'es-MX';
          const gender = urlObj.searchParams.get('gender') || 'male';
          const persona = urlObj.searchParams.get('persona') || '';
          const q = (urlObj.searchParams.get('q') || '').trim();

          if (!q) {
            res.statusCode = 400;
            res.end('Missing text');
            return;
          }

          const voiceInfo = resolveNativeHumanVoice(tl, gender, persona);
          const cacheKey = `${voiceInfo.voice}_${voiceInfo.pitch}_${voiceInfo.rate}_${q}`;

          if (ttsAudioCache.has(cacheKey)) {
            const cached = ttsAudioCache.get(cacheKey)!;
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.end(cached);
            return;
          }

          try {
            const mp3Buffer = await synthesizeNativeNeuralMp3(q, voiceInfo);
            ttsAudioCache.set(cacheKey, mp3Buffer);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.end(mp3Buffer);
            return;
          } catch {
            // Automatic fallback to Google Translate TTS if WebSocket firewall/timeout occurs
            const langCode = tl.split('-')[0] || 'es';
            const targetUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
              langCode
            )}&q=${encodeURIComponent(q.slice(0, 200))}`;
            https
              .get(
                targetUrl,
                {
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                  }
                },
                (upstream) => {
                  res.setHeader('Content-Type', 'audio/mpeg');
                  res.setHeader('Cache-Control', 'public, max-age=86400');
                  upstream.pipe(res);
                }
              )
              .on('error', () => {
                res.statusCode = 502;
                res.end();
              });
          }
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
    plugins: [tailwindcss(), react(), veraNeuralTtsProxy()],
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
