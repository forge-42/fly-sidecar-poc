# fly-sidecar-poc

```sh
fly apps create fly-sidecar-poc --org forge42-development
fly deploy --app fly-sidecar-poc
fly certs add 'fly-sidecar-poc.forge42.dev' --app fly-sidecar-poc
```
