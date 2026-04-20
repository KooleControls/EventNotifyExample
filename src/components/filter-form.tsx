import { useMemo, useRef, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  FILTER_OPS,
  availableKeysFromConditions,
  bestPreviewEvent,
  filterMatches,
  renderMessage,
  type FilterCondition,
  type FilterOp,
} from "@/lib/filters"
import type { DeviceEvent } from "@/lib/events"

export interface FilterFormValues {
  name: string
  cooldownHours: number
  conditions: FilterCondition[]
  messageTemplate: string
}

interface FilterFormProps {
  initial?: Partial<FilterFormValues>
  previewEvent?: DeviceEvent
  previewCandidates?: DeviceEvent[]
  onSubmit: (values: FilterFormValues) => void
  onCancel: () => void
}

const inputClass =
  "h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"

const textareaClass =
  "min-h-[7rem] w-full resize-y rounded-md border border-input bg-background p-2 text-sm font-mono outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"

export function FilterForm({
  initial,
  previewEvent,
  previewCandidates,
  onSubmit,
  onCancel,
}: FilterFormProps) {
  const [name, setName] = useState(initial?.name ?? "")
  const [cooldownHours, setCooldownHours] = useState(initial?.cooldownHours ?? 24)
  const [conditions, setConditions] = useState<FilterCondition[]>(
    initial?.conditions ?? [{ key: "", op: "eq", value: "" }]
  )
  const [messageTemplate, setMessageTemplate] = useState(
    initial?.messageTemplate ?? ""
  )
  const templateRef = useRef<HTMLTextAreaElement>(null)

  const updateCondition = (idx: number, patch: Partial<FilterCondition>) => {
    setConditions((cs) =>
      cs.map((c, i) => (i === idx ? { ...c, ...patch } : c))
    )
  }

  const removeCondition = (idx: number) => {
    setConditions((cs) => cs.filter((_, i) => i !== idx))
  }

  const addCondition = () => {
    setConditions((cs) => [...cs, { key: "", op: "eq", value: "" }])
  }

  const insertWildcard = (key: string) => {
    const ta = templateRef.current
    const token = `{{${key}}}`
    if (!ta) {
      setMessageTemplate((t) => t + token)
      return
    }
    const start = ta.selectionStart ?? messageTemplate.length
    const end = ta.selectionEnd ?? messageTemplate.length
    const next = messageTemplate.slice(0, start) + token + messageTemplate.slice(end)
    setMessageTemplate(next)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + token.length
      ta.setSelectionRange(pos, pos)
    })
  }

  const availableKeys = useMemo(
    () => availableKeysFromConditions(conditions),
    [conditions]
  )

  const previewSourceEvent = useMemo(
    () =>
      previewEvent ?? bestPreviewEvent(conditions, previewCandidates ?? []),
    [previewEvent, conditions, previewCandidates]
  )

  const previewSourceLabel = useMemo(() => {
    if (previewEvent) return "from selected event"
    const probe = {
      id: "_l",
      name: "",
      cooldownHours: 0,
      conditions,
      messageTemplate: "",
      createdAt: "",
    }
    const isReal = (previewCandidates ?? []).some((e) => filterMatches(probe, e))
    return isReal ? "from matching sample event" : "from condition values"
  }, [previewEvent, conditions, previewCandidates])

  const previewText = useMemo(
    () =>
      messageTemplate.trim()
        ? renderMessage(messageTemplate, previewSourceEvent)
        : "",
    [messageTemplate, previewSourceEvent]
  )

  const canSubmit =
    name.trim().length > 0 &&
    conditions.length > 0 &&
    conditions.every((c) => c.key.trim() !== "" && c.value.trim() !== "")

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      name: name.trim(),
      cooldownHours: Number.isFinite(cooldownHours) ? cooldownHours : 0,
      conditions: conditions.map((c) => ({
        key: c.key.trim(),
        op: c.op,
        value: c.value.trim(),
      })),
      messageTemplate: messageTemplate,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Name</span>
          <input
            className={inputClass}
            placeholder="e.g. Low lock battery"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Cooldown (h)</span>
          <input
            className={inputClass + " w-24"}
            type="number"
            min={0}
            step={1}
            value={cooldownHours}
            onChange={(e) => setCooldownHours(Number(e.target.value))}
          />
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Conditions (all must match)
          </span>
          <Button variant="outline" size="xs" onClick={addCondition}>
            <Plus />
            Add
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {conditions.map((c, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_7rem_1fr_auto] items-center gap-2"
            >
              <input
                className={inputClass}
                placeholder="key (e.g. battery_percent)"
                value={c.key}
                onChange={(e) => updateCondition(idx, { key: e.target.value })}
              />
              <select
                className={inputClass}
                value={c.op}
                onChange={(e) =>
                  updateCondition(idx, { op: e.target.value as FilterOp })
                }
              >
                {FILTER_OPS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                placeholder="value"
                value={c.value}
                onChange={(e) => updateCondition(idx, { value: e.target.value })}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeCondition(idx)}
                disabled={conditions.length === 1}
                aria-label="Remove condition"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Service-department message
            </span>
            <span className="text-xs text-muted-foreground">
              Use <code className="font-mono">{`{{key}}`}</code> wildcards
            </span>
          </div>
          <textarea
            ref={templateRef}
            className={textareaClass}
            placeholder="e.g. Low battery on {{source}} at {{objectName}} — currently {{battery_percent}}%."
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
          />
          {availableKeys.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {availableKeys.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => insertWildcard(k)}
                  className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-xs hover:bg-muted"
                >
                  {`{{${k}}}`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Preview</span>
            <span className="text-xs text-muted-foreground">
              {previewSourceLabel}
            </span>
          </div>
          <div className="min-h-[7rem] flex-1 rounded-md border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
            {previewText || (
              <span className="text-muted-foreground">
                Type a message to see the preview.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          Save filter
        </Button>
      </div>
    </div>
  )
}
