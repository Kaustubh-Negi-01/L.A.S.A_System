import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore - the Vercel function is intentionally reused by the local dev server.
import aiProxyHandler from './api/ai-proxy.js';

function localAiProxy(): Plugin {
  return {
    name: 'lasa-local-ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai-proxy', aiProxyHandler as any);
    }
  };
}

export default defineConfig({
  plugins: [react(), localAiProxy()],
  server: {
    port: 3000,
    open: false,
    allowedHosts: ['.manus.computer']
  }
});
