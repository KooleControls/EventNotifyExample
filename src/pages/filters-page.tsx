import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/modal"
import { FilterForm, type FilterFormValues } from "@/components/filter-form"
import { mockEvents } from "@/lib/events"
import {
  FILTER_OPS,
  addFilter,
  deleteFilter,
  updateFilter,
  useFilters,
  type Filter,
  type FilterCondition,
} from "@/lib/filters"

function describeCondition(c: FilterCondition): string {
  const op = FILTER_OPS.find((o) => o.value === c.op)?.label ?? c.op
  return `${c.key} ${op} ${c.value}`
}

export function FiltersPage() {
  const filters = useFilters()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Filter | null>(null)

  const handleCreate = (values: FilterFormValues) => {
    addFilter(values)
    setCreating(false)
  }

  const handleUpdate = (values: FilterFormValues) => {
    if (!editing) return
    updateFilter(editing.id, values)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    deleteFilter(id)
    if (editing?.id === id) setEditing(null)
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4 px-6 py-4">
        <div>
          <h1 className="text-lg font-medium">Filters</h1>
          <p className="text-sm text-muted-foreground">
            {filters.length} filters · click a row to edit
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus />
          New filter
        </Button>
      </div>

      <main className="px-6 pb-6">
        {filters.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No filters yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Conditions</th>
                  <th className="px-3 py-2 font-medium">Cooldown</th>
                  <th className="w-10 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filters.map((f) => {
                  const isEditing = editing?.id === f.id
                  return (
                    <tr
                      key={f.id}
                      onClick={() => setEditing(f)}
                      className={cn(
                        "cursor-pointer border-t border-border align-top transition-colors hover:bg-muted/40",
                        isEditing && "bg-muted/60"
                      )}
                    >
                      <td className="px-3 py-2 font-medium">{f.name}</td>
                      <td className="px-3 py-2">
                        <ul className="flex flex-col gap-0.5 font-mono text-xs">
                          {f.conditions.map((c, i) => (
                            <li key={i}>{describeCondition(c)}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">
                        {f.cooldownHours} h
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(f.id)
                          }}
                          aria-label="Delete filter"
                        >
                          <Trash2 />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New filter"
        description="Define conditions that must all match. Cooldown suppresses repeats."
        size="xl"
      >
        <FilterForm
          previewCandidates={mockEvents}
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit filter"
        description={editing?.name}
        size="xl"
      >
        {editing && (
          <FilterForm
            initial={{
              name: editing.name,
              cooldownHours: editing.cooldownHours,
              conditions: editing.conditions,
              messageTemplate: editing.messageTemplate,
            }}
            previewCandidates={mockEvents}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  )
}
