// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// NOTE: `site` is a placeholder until hosting is chosen. It only affects
// absolute URLs in the sitemap and canonical tags, so it is safe to change later.
export default defineConfig({
  site: "https://sulaimanshariff.com",
  output: "static",
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: "auto",
  },
});
