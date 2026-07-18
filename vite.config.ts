import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Plugin to serve static HTML from public/ before SPA fallback intercepts
function serveStaticHtml() {
  return {
    name: 'serve-static-html',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        // Check if the request is for a known static HTML directory
        if (req.url?.startsWith('/k12') || req.url?.startsWith('/4d') || req.url?.startsWith('/scout-clinical') || req.url?.startsWith('/conferences')) {
          const urlPath = req.url.split('?')[0]
          const filePath = urlPath.endsWith('/')
            ? path.join(process.cwd(), 'public', urlPath, 'index.html')
            : urlPath.endsWith('.html')
              ? path.join(process.cwd(), 'public', urlPath)
              : path.join(process.cwd(), 'public', urlPath, 'index.html')

          if (filePath && fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html')
            res.end(fs.readFileSync(filePath, 'utf-8'))
            return
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
// Using function form to access env vars at config time
export default defineConfig(({ mode }) => {
  // loadEnv with '' prefix loads ALL env vars (not just VITE_-prefixed)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      'import.meta.env.SUPABASE_SERVICE_KEY': JSON.stringify(env.SUPABASE_SERVICE_KEY),
    },
    plugins: [serveStaticHtml(), react()],
    server: {
      proxy: {
        // ── Salesloft API Proxy ──
        // The API key is injected HERE (server-side) so it never reaches the browser.
        // The client just calls /salesloft-api/v2/... with no auth header.
        '/salesloft-api': {
          target: 'https://api.salesloft.com',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/salesloft-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Inject auth header server-side — key never leaves the server
              proxyReq.setHeader('Authorization', `Bearer ${env.SALESLOFT_API_KEY}`)
              proxyReq.setHeader('Accept', 'application/json')
              proxyReq.setHeader('Content-Type', 'application/json')
            })
          },
        },
        // ── CMS API Proxy (deal-rooms.js on port 3001) ──
        '/cms-api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/cms-api/, '/api'),
        },
        // ── CMS Preview Proxy (deal-rooms.js rooms renderer) ──
        '/cms-preview': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/cms-preview/, '/rooms'),
        },
        // ── Google Calendar API Proxy (Express server on port 3000) ──
        '/api/google-calendar': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        // ── Discovery API Proxy (Express server on port 3000) ──
        '/api/discovery': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        // ── Agent API Proxy (Express server on port 3000) ──
        '/api/agent': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        // ── Granola API Proxy ──
        // The Granola API key is injected server-side so it never reaches the browser.
        // granolaClient.ts calls /granola-api/notes with no auth header.
        '/granola-api': {
          target: 'https://public-api.granola.ai/v1',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/granola-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.GRANOLA_API_KEY) {
                proxyReq.setHeader('Authorization', `Bearer ${env.GRANOLA_API_KEY}`)
              }
              proxyReq.setHeader('Accept', 'application/json')
            })
          },
        },
      },
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-Service-Alignment-Defense': 'ACTIVE - UNAUTHORIZED PROBING LOGGED'
      },
    },
    build: {
      rollupOptions: {
        output: {
          banner: '/* WARNING: TAMPERING WITH THIS ASSET WILL BE REPORTED. SECURED BY SERVICE ALIGNMENT. */'
        }
      }
    }
  }
})
