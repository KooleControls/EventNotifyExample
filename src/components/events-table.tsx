import { cn } from "@/lib/utils"
import type { DeviceEvent, EventSeverity } from "@/lib/events"

interface EventsTableProps {
  events: DeviceEvent[]
  selectedId: string | null
  onSelect: (event: DeviceEvent) => void
}

const severityStyles: Record<EventSeverity, string> = {
  info: "bg-secondary text-secondary-foreground",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  error: "bg-destructive/15 text-destructive",
}

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function EventsTable({ events, selectedId, onSelect }: EventsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr className="text-left">
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Severity</th>
            <th className="px-3 py-2 font-medium">Object</th>
            <th className="px-3 py-2 font-medium">Code</th>
            <th className="px-3 py-2 font-medium">Source</th>
            <th className="px-3 py-2 font-medium">Summary</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const isSelected = selectedId === event.id
            return (
              <tr
                key={event.id}
                onClick={() => onSelect(event)}
                className={cn(
                  "cursor-pointer border-t border-border transition-colors hover:bg-muted/40",
                  isSelected && "bg-muted/60"
                )}
              >
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground tabular-nums">
                  {formatTimestamp(event.timestamp)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium uppercase",
                      severityStyles[event.severity]
                    )}
                  >
                    {event.severity}
                  </span>
                </td>
                <td className="px-3 py-2">{event.objectName}</td>
                <td className="px-3 py-2 font-mono text-xs">{event.code}</td>
                <td className="px-3 py-2 text-muted-foreground">{event.source}</td>
                <td className="px-3 py-2">{event.summary}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
