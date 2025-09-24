
# fly-sidecar-poc

This repository demonstrates how to deploy a multi-container app on [fly.io](https://fly.io/) with Cloudflare protection and rate limiting. Key files: `cli-config.json`, `fly.toml`, and `nginx.conf`.

## What Does This PoC Show?

- **Requests are routed through Cloudflare**
- **Requests are rate limited**

## Cloudflare Origin Protection

**Goal:** Prevent direct access to your fly.io app, ensuring all traffic goes through Cloudflare for security, caching, and optimizations.

- **Custom Domain (via Cloudflare):** [fly-sidecar-poc.forge42.dev](https://fly-sidecar-poc.forge42.dev/)
- **Direct Fly.io Domain:** [fly-sidecar-poc.fly.dev](https://fly-sidecar-poc.fly.dev/)

**Expected Behavior:**

- Access via the custom domain (Cloudflare) works.
- Direct access to the fly.io domain returns a 403 error.

**How the Origin Check Works:**

1. Requests must come through `fly-proxy` (private IP range `172.16.0.0/16`).
2. Nginx sets the client IP from the [`Cf-Connecting-Ip`](https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-connecting-ip) header.
3. The [`Fly-Client-Ip`](https://www.fly.io/docs/networking/request-headers/#fly-client-ip) header must match Cloudflare’s [IPv4](https://www.cloudflare.com/ips-v4) or [IPv6](https://cloudflare.com/ips-v6) ranges.
4. If both checks pass, the request is proxied to the app on `localhost:80`.

## Rate Limiting

If you send requests too quickly, you'll receive a `503 Service Temporarily Unavailable` error.

The current setup is minimal: nginx realip modules uses the `Cf-Connecting-Ip` header to set `$remote_addr`, so rate limiting applies to the real client IP as seen by Cloudflare - not just to fly-proxy or Cloudflare as a whole. You can easily enhance this configuration by adding connection limits, burst and delay controls, or other traffic shaping options for more advanced rate limiting.

## Quick Start

### 1. Create a Fly.io App

Update the `app` value in `fly.toml` to match your app name.

```sh
export MY_FLY_APP_NAME="fly-sidecar-poc"
fly apps create $MY_FLY_APP_NAME --org YOUR-ORG
fly deploy --app $MY_FLY_APP_NAME
```

### 2. Add a Custom Domain (Cloudflare)

Replace `MY-FLY-APP.YOUR-DOMAIN.TLD` with your actual domain (must be managed in Cloudflare).

```sh
fly certs add 'MY-FLY-APP.YOUR-DOMAIN.TLD' --app $MY_FLY_APP_NAME
```

Follow the instructions to add the DNS entry in Cloudflare. For details on enabling the "orange cloud" (proxy), see [Fly.io Cloudflare setup guide](https://fly.io/docs/networking/understanding-cloudflare/#cdn-proxy-setup-quot-orange-cloud-quot).
