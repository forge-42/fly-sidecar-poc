
# fly-sidecar-poc

This repository demonstrates how to deploy a multi-container app on [fly.io](https://fly.io/) with Cloudflare protection and rate limiting. Key files: `cli-config.json`, `fly.toml`, and `nginx.conf`.

## What Does This PoC Show?

- **Requests are routed through Cloudflare**
- **Requests are rate limited**
- Read and Write to a file on a shared directory on the host machine. This could also be a persistent volume. In this example its just a mount on the host machine.

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

**Trying to spoof the headers to get access and bypass Cloudflare:**

I am using the [`xh`](https://github.com/ducaale/xh) cli tool to make requests in this example:

```sh
## Lets try to manually send the Cf-Connecting-Ip header Cloudflare is adding and/or setting X-Forwarded-For header:
➜ xh --headers GET https://fly-sidecar-poc.fly.dev/ "Cf-Connecting-Ip: 1.2.3.4" "X-Forwarded-For: 2.3.4.5"
HTTP/2.0 403 Forbidden
content-encoding: zstd
content-type: text/html
date: Wed, 24 Sep 2025 14:19:22 GMT
fly-request-id: 01K5Y1FQBBQ90R0K7GESSHG15P-fra
server: Fly/90a8089aa (2025-09-23)
via: 2 fly.io
x-fly-cip: cip:abcd:1234:5678:ef00:abcd:1234:5678:abcd
x-is-cf-client: is_cloudflare_client:0
x-is-fly-proxy: is_fly_proxy:1
x-ra: 1.2.3.4
x-realip-ra: 172.16.22.162
x-sidecar-response: true
x-valid-origins: V:0
```

## Rate Limiting

If you send requests too quickly, you'll receive a `503 Service Temporarily Unavailable` error.

The current setup is minimal: nginx realip modules uses the `Cf-Connecting-Ip` header to set `$remote_addr`, so rate limiting applies to the real client IP as seen by Cloudflare - not just to fly-proxy or Cloudflare as a whole. You can easily enhance this configuration by adding connection limits, burst and delay controls, or other traffic shaping options for more advanced rate limiting.

## Shared Host Directory

On both containers, the `/my-shared-dir` directory is mounted to a shared directory on the host machine. This allows both containers to read and write files in this directory. Even though its necessary to specify a `"volume"` configuration object with just the `"name"` property in the `cli-config.json`, its not an actual persistent fly volume. It seems this behavior is currently not documented in the fly.io docs.

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
