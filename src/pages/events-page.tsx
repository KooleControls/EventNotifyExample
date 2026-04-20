import { useState } from "react"

import { EventsTable } from "@/components/events-table"
import { EventDetailsPanel } from "@/components/event-details-panel"
import { mockEvents, type DeviceEvent } from "@/lib/events"

export function EventsPage() {
  const [selected, setSelected] = useState<DeviceEvent | null>(null)

  return (
    <div className="flex gap-6 px-6 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
          <h1 className="text-lg font-medium">Events</h1>
          <p className="text-sm text-muted-foreground">
            {mockEvents.length} events · click a row for details
          </p>
        </div>
        <EventsTable
          events={mockEvents}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
      </div>

      {selected && (
        <EventDetailsPanel
          event={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
