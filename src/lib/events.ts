export type EventSeverity = "info" | "warn" | "error"

export type EventPropertyValue = string | number | boolean

export interface EventProperty {
  key: string
  value: EventPropertyValue
  type: "string" | "int" | "float" | "bool" | "hex"
  unit?: string
}

export interface DeviceEvent {
  id: string
  timestamp: string
  code: string
  severity: EventSeverity
  objectId: string
  objectName: string
  source: string
  summary: string
  properties: EventProperty[]
}

const now = Date.now()
const t = (offsetSeconds: number) =>
  new Date(now - offsetSeconds * 1000).toISOString()

const HOUSES = {
  oak: { id: "obj-oak-12", name: "Oakwood Lane 12" },
  birch: { id: "obj-birch-3", name: "Birchgrove 3" },
  maple: { id: "obj-maple-87", name: "Maple Street 87" },
  willow: { id: "obj-willow-5", name: "Willow Park 5a" },
} as const

export const mockEvents: DeviceEvent[] = [
  {
    id: "evt-001",
    timestamp: t(4),
    code: "thermostat.temp_actual_changed",
    severity: "info",
    objectId: HOUSES.oak.id,
    objectName: HOUSES.oak.name,
    source: "Thermostat #1",
    summary: "Room temperature 21.4 °C",
    properties: [
      { key: "device_id", value: 0x46, type: "hex" },
      { key: "device_type", value: "thermostat", type: "string" },
      { key: "protocol", value: "opentherm", type: "string" },
      { key: "temperature", value: 21.4, type: "float", unit: "°C" },
      { key: "setpoint", value: 22.0, type: "float", unit: "°C" },
    ],
  },
  {
    id: "evt-002",
    timestamp: t(38),
    code: "modbus.timeout",
    severity: "warn",
    objectId: HOUSES.birch.id,
    objectName: HOUSES.birch.name,
    source: "Gateway",
    summary: "No response from unit 0x12, register 0x0040",
    properties: [
      { key: "unit_addr", value: 0x12, type: "hex" },
      { key: "register_addr", value: 0x0040, type: "hex" },
      { key: "timeout_ms", value: 1500, type: "int", unit: "ms" },
      { key: "retry_count", value: 3, type: "int" },
      { key: "transport", value: "rtu", type: "string" },
    ],
  },
  {
    id: "evt-003",
    timestamp: t(72),
    code: "hvac.fault_detected",
    severity: "error",
    objectId: HOUSES.maple.id,
    objectName: HOUSES.maple.name,
    source: "HVAC Samsung #2",
    summary: "Indoor unit reports fault 0x1A03",
    properties: [
      { key: "hvac_id", value: 2, type: "int" },
      { key: "hvac_type", value: "samsung", type: "string" },
      { key: "fault_code", value: 0x1a03, type: "hex" },
      { key: "error_active", value: true, type: "bool" },
      { key: "unit_address", value: 0x21, type: "hex" },
    ],
  },
  {
    id: "evt-004",
    timestamp: t(120),
    code: "thermostat.setpoint_changed",
    severity: "info",
    objectId: HOUSES.oak.id,
    objectName: HOUSES.oak.name,
    source: "Thermostat #1",
    summary: "Setpoint 21.0 → 22.5 °C",
    properties: [
      { key: "device_id", value: 0x46, type: "hex" },
      { key: "previous_setpoint", value: 21.0, type: "float", unit: "°C" },
      { key: "setpoint", value: 22.5, type: "float", unit: "°C" },
      { key: "override_pending", value: false, type: "bool" },
    ],
  },
  {
    id: "evt-005",
    timestamp: t(180),
    code: "hvac.mode_changed",
    severity: "info",
    objectId: HOUSES.willow.id,
    objectName: HOUSES.willow.name,
    source: "HVAC Daikin #1",
    summary: "Mode off → heat",
    properties: [
      { key: "hvac_id", value: 1, type: "int" },
      { key: "hvac_type", value: "daikin", type: "string" },
      { key: "previous_mode", value: "off", type: "string" },
      { key: "new_mode", value: "heat", type: "string" },
      { key: "write_source", value: true, type: "bool" },
    ],
  },
  {
    id: "evt-006",
    timestamp: t(245),
    code: "gateway.boiler_fault",
    severity: "error",
    objectId: HOUSES.maple.id,
    objectName: HOUSES.maple.name,
    source: "Boiler",
    summary: "Low water pressure — service required",
    properties: [
      { key: "fault_type", value: "low_pressure", type: "string" },
      { key: "oem_fault_code", value: 0x07, type: "hex" },
      { key: "service_request", value: true, type: "bool" },
      { key: "water_pressure", value: 0.4, type: "float", unit: "bar" },
    ],
  },
  {
    id: "evt-007",
    timestamp: t(310),
    code: "gateway.temperature_alarm",
    severity: "warn",
    objectId: HOUSES.birch.id,
    objectName: HOUSES.birch.name,
    source: "Temp Monitor",
    summary: "Sensor reads below threshold",
    properties: [
      { key: "alarm_type", value: "under_temp", type: "string" },
      { key: "actual_temp", value: 4.2, type: "float", unit: "°C" },
      { key: "threshold", value: 5.0, type: "float", unit: "°C" },
      { key: "severity", value: 2, type: "int" },
      { key: "sensor_id", value: 3, type: "int" },
    ],
  },
  {
    id: "evt-008",
    timestamp: t(420),
    code: "thermostat.heating_request",
    severity: "info",
    objectId: HOUSES.willow.id,
    objectName: HOUSES.willow.name,
    source: "Thermostat #2",
    summary: "Heating request raised",
    properties: [
      { key: "device_id", value: 0x47, type: "hex" },
      { key: "request_active", value: true, type: "bool" },
      { key: "timestamp_ms", value: 1734567890, type: "int" },
    ],
  },
  {
    id: "evt-009",
    timestamp: t(560),
    code: "modbus.error",
    severity: "error",
    objectId: HOUSES.maple.id,
    objectName: HOUSES.maple.name,
    source: "HVAC Mitsubishi #1",
    summary: "CRC error on register write",
    properties: [
      { key: "error_code", value: 0x04, type: "hex" },
      { key: "device_type", value: "mitsubishi", type: "string" },
      { key: "timeout_ms", value: 800, type: "int", unit: "ms" },
      { key: "retry_count", value: 1, type: "int" },
    ],
  },
  {
    id: "evt-010",
    timestamp: t(900),
    code: "hvac.actual_temp_changed",
    severity: "info",
    objectId: HOUSES.maple.id,
    objectName: HOUSES.maple.name,
    source: "HVAC Samsung #1",
    summary: "Indoor unit reports 23.1 °C",
    properties: [
      { key: "hvac_id", value: 1, type: "int" },
      { key: "temperature", value: 23.1, type: "float", unit: "°C" },
      { key: "unit_address", value: 0x20, type: "hex" },
    ],
  },
  {
    id: "evt-011",
    timestamp: t(1320),
    code: "gateway.smarthome_state",
    severity: "info",
    objectId: HOUSES.oak.id,
    objectName: HOUSES.oak.name,
    source: "Gateway",
    summary: "State: Vacant → Preheating",
    properties: [
      { key: "previous_state", value: "Vacant", type: "string" },
      { key: "new_state", value: "Preheating", type: "string" },
      { key: "trigger", value: "schedule", type: "string" },
    ],
  },
  {
    id: "evt-013",
    timestamp: t(1620),
    code: "lock.battery_changed",
    severity: "warn",
    objectId: HOUSES.birch.id,
    objectName: HOUSES.birch.name,
    source: "Front Door Lock",
    summary: "Lock battery 28% → 24%",
    properties: [
      { key: "lock_id", value: 0x0a, type: "hex" },
      { key: "device_type", value: "door_lock", type: "string" },
      { key: "battery_percent", value: 24, type: "int", unit: "%" },
      { key: "previous_percent", value: 28, type: "int", unit: "%" },
      { key: "battery_voltage", value: 5.4, type: "float", unit: "V" },
      { key: "low_battery", value: true, type: "bool" },
    ],
  },
  {
    id: "evt-012",
    timestamp: t(1800),
    code: "xbee.link_lost",
    severity: "warn",
    objectId: HOUSES.willow.id,
    objectName: HOUSES.willow.name,
    source: "XBee Coordinator",
    summary: "Lost link to remote node 0x0013A200",
    properties: [
      { key: "remote_addr", value: "0x0013A200_4051F8C2", type: "string" },
      { key: "rssi_last", value: -84, type: "int", unit: "dBm" },
      { key: "missed_polls", value: 6, type: "int" },
    ],
  },
]

export function formatPropertyValue(p: EventProperty): string {
  if (p.type === "hex" && typeof p.value === "number") {
    return `0x${p.value.toString(16).toUpperCase().padStart(2, "0")}`
  }
  if (p.type === "bool") return p.value ? "true" : "false"
  if (p.type === "float" && typeof p.value === "number") {
    const s = Number.isInteger(p.value) ? p.value.toFixed(1) : p.value.toString()
    return p.unit ? `${s} ${p.unit}` : s
  }
  if (p.unit) return `${p.value} ${p.unit}`
  return String(p.value)
}
