import fs from "node:fs/promises"
import type { Route } from "./+types/shared-file-myapp"
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
  const flyMachineId = process.env.FLY_MACHINE_ID
  return {
    sharedFile,
    nowInMilliseconds,
    fileContents,
    flyMachineId,
  }
}

export default function Foo({ loaderData }: Route.ComponentProps) {
  const { sharedFile, nowInMilliseconds, fileContents, flyMachineId } = loaderData
  return (
    <>
      <Link to="/">Home</Link><br />
      <h1>Writing '{nowInMilliseconds}' to '{sharedFile}' on '{flyMachineId ?? 'Not running on Fly.io'}'</h1>

      <h2>File Contents of '{sharedFile}':</h2>
      <pre>{fileContents}</pre>
    </>
  )
}
