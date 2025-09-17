import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  let headersObj: { [key: string]: any } = {}
  for (const [key, value] of request.headers) {
    headersObj[key] = value;
  }
  console.dir(headersObj);
  return {}
}

export default function Home() {
  return <Welcome />;
}
