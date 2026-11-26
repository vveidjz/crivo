export const testDir = "./tests"
export const testMatch = "**/*.spec.ts"
export const updateSnapshots = "none"
export const use = { channel: "chrome", baseURL: "http://127.0.0.1:4178" }
export const webServer = {
  command:
    "pnpm run build && pnpm run preview --host 127.0.0.1 --port 4178 --strictPort",
  url: use.baseURL,
}
