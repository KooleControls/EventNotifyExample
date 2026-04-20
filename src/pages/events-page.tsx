import { useState } from "react"

import { EventsTable } from "@/components/events-table"
import { EventDetailsPanel } from "@/components/event-details-panel"
import { mockEvents, type DeviceEvent } from "@/lib/events"

export function EventsPage() {
  const [selected, setSelected] = useState<DeviceEvent | null>(null)

  return (
    <>
      <div className="px-6 py-4">
        <h1 className="text-lg font-medium">Events</h1>
        <p className="text-sm text-muted-foreground">
          {mockEvents.length} events · click a row for details
        </p>
      </div>

      <main className="px-6 pb-6">
        <EventsTable
          events={mockEvents}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
      </main>

      <EventDetailsPanel event={selected} onClose={() => setSelected(null)} />
    </>
  )
}
