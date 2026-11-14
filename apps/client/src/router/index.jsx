import { createBrowserRouter } from "react-router-dom"

import HomePage from "../pages/HomePage.jsx"

// Routes are added per task in the Daily Execution Plan (auth, menu, cart, checkout, account, admin)
export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "*", element: <HomePage /> },
])
