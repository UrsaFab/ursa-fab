# Ursa fab. Decap OAuth proxy

This Cloudflare Worker provides the GitHub OAuth callback required by Decap CMS
when the public site is hosted on GitHub Pages.

## One-time setup

1. Create a GitHub OAuth App at <https://github.com/settings/developers>.
2. Set its callback URL to:

   `https://auth.ursafab.co.uk/callback`

3. Authenticate Wrangler from this directory:

   ```sh
   npx wrangler login
   ```

4. Add the OAuth credentials as Cloudflare Worker secrets:

   ```sh
   npx wrangler secret put GITHUB_OAUTH_ID
   npx wrangler secret put GITHUB_OAUTH_SECRET
   ```

5. Deploy the Worker:

   ```sh
   npm install
   npm run deploy
   ```

The GitHub OAuth account must have push access to `UrsaFab/ursa-fab`.
