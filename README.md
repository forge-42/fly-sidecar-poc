# fly-sidecar-poc

This repository, specifically the files `cli-config.json`, `fly.toml`, and `nginx.conf`, demonstrates how to use the multi-container deployment functionality on fly.io. You can also refer to the official [fly.io Multi-Container deployment documentation](https://fly.io/docs/machines/guides-examples/multi-container-machines/). Unfortunately, the `fly.toml` appears to be incorrect and did not function as documented. However, the `fly.toml` in this repository does work.

This PoC is deployed at <https://fly-sidecar-poc.fly.dev/> and the custom domain <https://fly-sidecar-poc.forge42.dev/> points to it. You will receive a successful response only by visiting the custom domain. If you access the app directly on `fly.dev`, you will encounter a 403 error.

The Cloudflare origin check works by first ensuring that the request is forwarded from `fly-proxy`, which typically uses the private IP range `172.16.0.0/16`. Only when the request originates from this IP range does nginx set the client IP from the [`Cf-Connecting-Ip` header](https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-connecting-ip). This check is technically unnecessary, as it should not be possible to bypass fly-proxy and this condition should always hold true.

Next, we check if the [`Fly-Client-Ip` header](https://www.fly.io/docs/networking/request-headers/#fly-client-ip) matches any of the publicly available [IPv4](https://www.cloudflare.com/ips-v4) and [IPv6](https://cloudflare.com/ips-v6) ranges from Cloudflare. This header reflects the client's IP address from the perspective of the fly-proxy, and we want to restrict it to Cloudflare IPs only. If both conditions are satisfied, we proxy the request to the actual app on localhost:80.

You can test the rate limiting by making requests in quick succession. If you are rate limited, you will see a `503 Service Temporarily Unavailable` message.

## 1. Create a new fly app in your fly org

Make sure to also change the `app` setting in the `fly.toml` accordingly.

```sh
export MY_FLY_APP_NAME="fly-sidecar-poc"
fly apps create $MY_FLY_APP_NAME --org YOUR-ORG
fly deploy --app $MY_FLY_APP_NAME
```

## 2. Add a custom domain to your fly app

First you will need to add a custom certificate to your fly.io app. Make sure you change `MY-FLY-APP.YOUR-DOMAIN.TLD` to an actual value of a domain you own and have access to on Cloudflare.

```sh
# Add a custom certificate to your app
fly certs add 'MY-FLY-APP.YOUR-DOMAIN.TLD' --app $MY_FLY_APP_NAME
```

Follow the instructions provided to add the DNS entry to Cloudflare for the custom domain. For more detailed information on adding a custom domain to Cloudflare and enabling its functionality (orange cloud), visit: <https://fly.io/docs/networking/understanding-cloudflare/#cdn-proxy-setup-quot-orange-cloud-quot>.
