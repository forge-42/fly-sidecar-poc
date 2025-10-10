import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/shared-file-myapp", "routes/shared-file-myapp.tsx"),
  route("/__health", "routes/health.tsx"),
] satisfies RouteConfig;
