import { cn } from "@/lib/utils"

export type PageId = "events" | "filters"

const NAV: { id: PageId; label: string }[] = [
  { id: "events", label: "Events" },
  { id: "filters", label: "Filters" },
]

interface TopBarProps {
  current: PageId
  onNavigate: (page: PageId) => void
}

export function TopBar({ current, onNavigate }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex items-center gap-6 px-6 py-3">
        <span className="text-sm font-semibold tracking-tight">EventNotify</span>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = item.id === current
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
