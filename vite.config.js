import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from "vite-plugin-sitemap";
import routes from './src/sitemap-routes.js'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    sitemap({
      hostname: "https://docuhealthservices.net",
      routes: routes,
      readable: true,
      exclude: [
        "/dashboard*",
        "/hospital-*",
        "/admin*",
      ],
    }),
  ],
  
})
