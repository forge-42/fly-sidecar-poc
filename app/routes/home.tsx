import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ request, context }: Route.LoaderArgs) {
  let headers: { [key: string]: any } = {}
  for (const [key, value] of request.headers) {
    headers[key] = value;
  }
  console.dir({ headers, url: request.url, method: request.method, context });
  return {}
}

export default function Home() {
  return <>
    <Welcome />
    <Link to="/shared-file-myapp">Write timestamp to the Shared File from 'myapp' container</Link><br />
    <a href="/shared-file-nginx">Show File Contents of Shared File directly by Nginx Container</a><br />
  </>;
}
