import { useState } from "react"
import { Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/modal"
import { FilterForm, type FilterFormValues } from "@/components/filter-form"
import { formatPropertyValue, type DeviceEvent } from "@/lib/events"
import {
  addFilter,
  conditionsFromEvent,
  filtersMatchingEvent,
  useFilters,
} from "@/lib/filters"

interface EventDetailsPanelProps {
  event: DeviceEvent
  onClose: () => void
}

export function EventDetailsPanel({ event, onClose }: EventDetailsPanelProps) {
  const filters = useFilters()
  const [creatingFilter, setCreatingFilter] = useState(false)

  const matching = filtersMatchingEvent(filters, event)

  const handleSubmitNewFilter = (values: FilterFormValues) => {
    addFilter(values)
    setCreatingFilter(false)
  }

  return (
    <aside className="sticky top-14 flex max-h-[calc(100svh-3.5rem)] w-96 shrink-0 flex-col self-start overflow-hidden rounded-lg border border-border bg-card">
      <Modal
        open={creatingFilter}
        onClose={() => setCreatingFilter(false)}
        title="New filter from event"
        description="Conditions are pre-filled from this event. Adjust or remove rows."
        size="xl"
      >
        <FilterForm
          initial={{
            name: event.code,
            cooldownHours: 24,
            conditions: conditionsFromEvent(event),
            messageTemplate: `Event {{code}} on {{source}} at {{objectName}}.`,
          }}
          previewEvent={event}
          onSubmit={handleSubmitNewFilter}
          onCancel={() => setCreatingFilter(false)}
        />
      </Modal>

      <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-muted-foreground">
            {event.code}
          </p>
          <h2 className="mt-0.5 truncate text-base font-medium">
            {event.summary}
          </h2>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <X />
        </Button>
      </header>

      <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
        <section className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <span className="text-muted-foreground">Object</span>
          <span>
            {event.objectName}
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {event.objectId}
            </span>
          </span>
          <span className="text-muted-foreground">Source</span>
          <span>{event.source}</span>
          <span className="text-muted-foreground">Severity</span>
          <span className="uppercase">{event.severity}</span>
          <span className="text-muted-foreground">Timestamp</span>
          <span className="font-mono text-xs">
            {new Date(event.timestamp).toLocaleString()}
          </span>
          <span className="text-muted-foreground">Event ID</span>
          <span className="font-mono text-xs">{event.id}</span>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Matching filters ({matching.length})
            </h3>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setCreatingFilter(true)}
            >
              <Plus />
              New from event
            </Button>
          </div>
          {matching.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              No filter matches this event yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {matching.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
                >
                  <span>{f.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {f.cooldownHours} h
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Properties
          </h3>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <tbody>
                {event.properties.map((p, idx) => (
                  <tr
                    key={p.key}
                    className={cn(
                      idx > 0 && "border-t border-border",
                      "align-top"
                    )}
                  >
                    <td className="w-1/2 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                      {p.key}
                      <span className="ml-1 text-[10px] opacity-60">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs">
                      {formatPropertyValue(p)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </aside>
  )
}
