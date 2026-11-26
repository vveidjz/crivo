import { deepEqual } from "node:assert/strict"
import { readdirSync } from "node:fs"
import { test } from "node:test"

test("keeps test files and snapshots outside src", () => {
  const entries = readdirSync("src", {
    recursive: true,
  })
  const misplaced = entries.filter(
    (name) =>
      /(?:^|[/\\])(?:__tests__|__snapshots__|[^/\\]+-snapshots|tests)(?:[/\\]|$)/.test(
        name,
      ) || /\.(?:test|spec)\.(?:[cm]?[jt]sx?)$/.test(name),
  )
  deepEqual(misplaced, [])
})
