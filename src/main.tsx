import "#src/style.css"
import { createRoot } from "react-dom/client"
import { App } from "#src/App.tsx"

const root = document.getElementById("root")
if (!root) throw Error("Root element is missing.")
createRoot(root).render(<App />)
