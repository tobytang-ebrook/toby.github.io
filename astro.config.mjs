// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://tobytang-bot.github.io",
  base: "/",
  trailingSlash: "always",

  // Legacy Jekyll URLs (/posts/:title/) → new content routes.
  // The old host (tobytang-ebrook.github.io/toby.github.io/) is handled by a
  // redirect-only site in the legacy repo; these cover old paths on the new host.
  redirects: {
    "/posts/server/": "/knowledge/magento/server-setup/",
    "/posts/docker-command/": "/knowledge/docker/docker-command/",
    // The old mysql-command post had no body; its commands live in server-setup.
    "/posts/mysql-command/": "/knowledge/magento/server-setup/",
    "/posts/jekyll-markdown/": "/",
  },
});
