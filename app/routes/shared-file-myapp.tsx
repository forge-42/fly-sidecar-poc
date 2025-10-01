import fs from "node:fs/promises"
import type { Route } from "./+types/access-shared-file"
import { Link } from "react-router"


export async function loader() {
  const sharedFile = process.env.MY_SHARED_FILE || "./shared.txt"
  const nowInMilliseconds = Date.now()

  // Append the current unix timestamp with milisceconds to the file at /foo/shared.txt, making sure that its automatically created if it doesn't exist.
  const handle = await fs.open(sharedFile, "a+")
  await handle.writeFile(`${nowInMilliseconds}\n`)
  await handle.close()
  const fileContents = await fs.readFile(sharedFile, "utf-8")
  console.log("Writing to shared file", { sharedFile, nowInMilliseconds })
  return {
    sharedFile,
    nowInMilliseconds,
    fileContents,
  }
}

export default function Foo({ loaderData }: Route.ComponentProps) {
  const { sharedFile, nowInMilliseconds, fileContents } = loaderData
  return (
    <>
      <Link to="/">Home</Link><br />
      <h1>Writing '{nowInMilliseconds}' to '{sharedFile}'</h1>
      <h2>File Contents of '{sharedFile}':</h2>
      <pre>{fileContents}</pre>
    </>
  )
}
