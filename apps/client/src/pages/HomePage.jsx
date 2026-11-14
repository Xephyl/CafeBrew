import { useEffect, useState } from "react"

import api from "../lib/axios.js"

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState("checking")

  useEffect(() => {
    api
      .get("/api/health")
      .then(() => setApiStatus("connected"))
      .catch(() => setApiStatus("unreachable"))
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary text-primary">
      <h1 className="text-5xl font-bold">CafeBrew</h1>
      <p className="mt-4 text-lg">Fresh coffee, baked goods, and more.</p>
      <p className="mt-8 rounded-full bg-primary px-4 py-1 text-sm text-secondary">
        API: {apiStatus}
      </p>
    </main>
  )
}
