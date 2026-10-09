import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Social scrapers need absolute URLs. On Vercel, VERCEL_PROJECT_PRODUCTION_URL is the
// production domain (custom domain if set, otherwise *.vercel.app); SITE_URL overrides it.
const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:5173')
).replace(/\/$/, '')

const siteUrlPlugin = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteUrlPlugin()],
})
