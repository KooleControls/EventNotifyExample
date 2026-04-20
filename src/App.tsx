import { useState } from "react"

import { TopBar, type PageId } from "@/components/top-bar"
import { EventsPage } from "@/pages/events-page"
import { FiltersPage } from "@/pages/filters-page"

export function App() {
  const [page, setPage] = useState<PageId>("events")

  return (
    <div className="min-h-svh bg-background">
      <TopBar current={page} onNavigate={setPage} />
      {page === "events" ? <EventsPage /> : <FiltersPage />}
    </div>
  )
}

export default App
