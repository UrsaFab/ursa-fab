import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://ursafab.co.uk",
  integrations: [sitemap()]
});