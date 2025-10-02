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
  const flyMachineId = process.env.FLY_MACHINE_ID
  return {
    flyMachineId,
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { flyMachineId } = loaderData
  return <>
    <Welcome />
    <div className="text-center mt-4">
      <div>Fly Machine ID: {flyMachineId ?? "Not running on Fly.io"}</div>
      <Link className="text-blue-700 hover:underline dark:text-blue-500" to="/shared-file-myapp">Write timestamp to the Shared File from 'myapp' container</Link><br />
      <a className="text-blue-700 hover:underline dark:text-blue-500" href="/shared-file-nginx">Show File Contents of Shared File directly by Nginx Container</a><br />
    </div>
  </>;
}
