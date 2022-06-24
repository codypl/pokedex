import { defineConfig } from 'astro/config';
import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://cody-pokedex.netlify.app',
  experimental: {
    integrations: true
  },
  integrations: [preact(), tailwind(), robotsTxt(), webmanifest({
    icon: 'src/images/pokeball.png',
    // source for favicon & icons
    name: 'Pokédex',
    // required
    short_name: 'Pokdédex',
    description: 'Pokédex for the web',
    start_url: '/',
    theme_color: '#3367D6',
    background_color: '#3367D6',
    display: 'standalone'
  }), sitemap()]
});