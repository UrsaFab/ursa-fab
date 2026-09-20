interface Env {
  GITHUB_OAUTH_ID: string;
  GITHUB_OAUTH_SECRET: string;
  GITHUB_REPO_PRIVATE?: string;
}

function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function callbackUrl(url: URL): string {
  return `https://${url.hostname}/callback?provider=github`;
}

function authorizationUrl(url: URL, env: Env): string {
  const scope = env.GITHUB_REPO_PRIVATE === "1" ? "repo,user" : "public_repo,user";
  const params = new URLSearchParams({
    client_id: env.GITHUB_OAUTH_ID,
    redirect_uri: callbackUrl(url),
    response_type: "code",
    scope,
    state: randomState(),
  });

  return `https://github.com/login/oauth/authorize?${params}`;
}

async function exchangeCode(code: string, url: URL, env: Env): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      code,
      redirect_uri: callbackUrl(url),
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed with status ${response.status}`);
  }

  const result = (await response.json()) as { access_token?: string; error?: string };
  if (!result.access_token) {
    throw new Error(result.error || "GitHub did not return an access token");
  }

  return result.access_token;
}

function callbackResponse(status: "success" | "error", payload: Record<string, string>): Response {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const escapedMessage = JSON.stringify(message);

  return new Response(
    `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Authorising Decap CMS</title></head>
  <body>
    <p>Authorising Decap CMS...</p>
    <script>
      const receiveMessage = () => {
        window.opener.postMessage(${escapedMessage}, "*");
        window.removeEventListener("message", receiveMessage, false);
        window.close();
      };
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    </script>
  </body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/auth") {
      if (!env.GITHUB_OAUTH_ID || !env.GITHUB_OAUTH_SECRET) {
        return new Response("OAuth proxy is not configured", { status: 503 });
      }

      return Response.redirect(authorizationUrl(url, env), 302);
    }

    if (url.pathname === "/callback") {
      const error = url.searchParams.get("error");
      if (error) {
        return callbackResponse("error", { error });
      }

      const code = url.searchParams.get("code");
      if (!code) {
        return callbackResponse("error", { error: "Missing GitHub authorization code" });
      }

      try {
        const token = await exchangeCode(code, url, env);
        return callbackResponse("success", { token });
      } catch (error) {
        const message = error instanceof Error ? error.message : "OAuth token exchange failed";
        return callbackResponse("error", { error: message });
      }
    }

    return new Response("Ursa fab. Decap OAuth proxy", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
