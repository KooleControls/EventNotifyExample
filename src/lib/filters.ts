import { useSyncExternalStore } from "react"

import type {
  DeviceEvent,
  EventProperty,
  EventPropertyValue,
  EventSeverity,
} from "@/lib/events"

export type FilterOp = "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "contains"

export const FILTER_OPS: { value: FilterOp; label: string }[] = [
  { value: "eq", label: "equals" },
  { value: "neq", label: "not equals" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "contains", label: "contains" },
]

export interface FilterCondition {
  key: string
  op: FilterOp
  value: string
}

export interface Filter {
  id: string
  name: string
  cooldownHours: number
  conditions: FilterCondition[]
  messageTemplate: string
  createdAt: string
}

const BUILTIN_KEYS = new Set([
  "code",
  "severity",
  "source",
  "objectId",
  "objectName",
])

function getEventValue(event: DeviceEvent, key: string): EventPropertyValue | undefined {
  if (BUILTIN_KEYS.has(key)) {
    return (event as unknown as Record<string, EventPropertyValue>)[key]
  }
  return event.properties.find((p) => p.key === key)?.value
}

function coerce(raw: string, sample: EventPropertyValue | undefined): EventPropertyValue {
  if (typeof sample === "number") {
    const n = Number(raw)
    return Number.isNaN(n) ? raw : n
  }
  if (typeof sample === "boolean") {
    if (raw === "true") return true
    if (raw === "false") return false
  }
  return raw
}

export function evaluateCondition(c: FilterCondition, event: DeviceEvent): boolean {
  const left = getEventValue(event, c.key)
  if (left === undefined) return false
  const right = coerce(c.value, left)

  switch (c.op) {
    case "eq":
      return left === right
    case "neq":
      return left !== right
    case "lt":
      return typeof left === "number" && typeof right === "number" && left < right
    case "lte":
      return typeof left === "number" && typeof right === "number" && left <= right
    case "gt":
      return typeof left === "number" && typeof right === "number" && left > right
    case "gte":
      return typeof left === "number" && typeof right === "number" && left >= right
    case "contains":
      return String(left).toLowerCase().includes(String(right).toLowerCase())
  }
}

export function filterMatches(filter: Filter, event: DeviceEvent): boolean {
  if (filter.conditions.length === 0) return false
  return filter.conditions.every((c) => evaluateCondition(c, event))
}

let _filters: Filter[] = [
  {
    id: "flt-001",
    name: "Low lock battery",
    cooldownHours: 24,
    conditions: [
      { key: "code", op: "eq", value: "lock.battery_changed" },
      { key: "battery_percent", op: "lt", value: "25" },
    ],
    messageTemplate:
      "Low battery on {{source}} at {{objectName}} — currently {{battery_percent}}%. Schedule a replacement.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "flt-002",
    name: "Any HVAC fault",
    cooldownHours: 1,
    conditions: [{ key: "code", op: "eq", value: "hvac.fault_detected" }],
    messageTemplate:
      "HVAC fault {{fault_code}} on unit {{hvac_id}} ({{hvac_type}}) at {{objectName}}. Service required.",
    createdAt: new Date().toISOString(),
  },
]

const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot() {
  return _filters
}

export function useFilters(): Filter[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function addFilter(filter: Omit<Filter, "id" | "createdAt">): Filter {
  const created: Filter = {
    ...filter,
    id: `flt-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  }
  _filters = [..._filters, created]
  emit()
  return created
}

export function updateFilter(
  id: string,
  patch: Omit<Filter, "id" | "createdAt">
) {
  _filters = _filters.map((f) => (f.id === id ? { ...f, ...patch } : f))
  emit()
}

export function deleteFilter(id: string) {
  _filters = _filters.filter((f) => f.id !== id)
  emit()
}

export function filtersMatchingEvent(filters: Filter[], event: DeviceEvent): Filter[] {
  return filters.filter((f) => filterMatches(f, event))
}

export function conditionsFromEvent(event: DeviceEvent): FilterCondition[] {
  const conds: FilterCondition[] = [
    { key: "code", op: "eq", value: event.code },
  ]
  for (const p of event.properties) {
    conds.push({ key: p.key, op: "eq", value: String(p.value) })
  }
  return conds
}

export const TEMPLATE_BUILTIN_KEYS = [
  "code",
  "severity",
  "source",
  "objectName",
  "objectId",
] as const

export function availableKeysFromConditions(
  conditions: FilterCondition[]
): string[] {
  const set = new Set<string>(TEMPLATE_BUILTIN_KEYS)
  for (const c of conditions) if (c.key.trim()) set.add(c.key.trim())
  return [...set]
}

export function renderMessage(template: string, event: DeviceEvent): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const v = getEventValue(event, key)
    if (v === undefined) return `{{${key}}}`
    if (typeof v === "number" && !Number.isInteger(v)) {
      return v.toString()
    }
    return String(v)
  })
}

export function bestPreviewEvent(
  conditions: FilterCondition[],
  candidates: DeviceEvent[]
): DeviceEvent {
  const probe: Filter = {
    id: "_preview",
    name: "",
    cooldownHours: 0,
    conditions,
    messageTemplate: "",
    createdAt: "",
  }
  const match = candidates.find((e) => filterMatches(probe, e))
  return match ?? synthEventFromConditions(conditions)
}

export function synthEventFromConditions(
  conditions: FilterCondition[]
): DeviceEvent {
  const builtins: Record<string, string> = {}
  const propMap = new Map<string, EventProperty>()

  for (const c of conditions) {
    const key = c.key.trim()
    if (!key) continue
    if (BUILTIN_KEYS.has(key)) {
      builtins[key] = c.value
    } else {
      const num = Number(c.value)
      const isNum = c.value.trim() !== "" && !Number.isNaN(num)
      propMap.set(key, {
        key,
        value: isNum ? num : c.value,
        type: isNum ? "float" : "string",
      })
    }
  }
  const properties = [...propMap.values()]

  return {
    id: "preview",
    timestamp: new Date().toISOString(),
    code: builtins.code ?? "preview.event",
    severity: (builtins.severity as EventSeverity) ?? "info",
    objectId: builtins.objectId ?? "obj-preview",
    objectName: builtins.objectName ?? "Sample House",
    source: builtins.source ?? "Sample Source",
    summary: "Preview event",
    properties,
  }
}
