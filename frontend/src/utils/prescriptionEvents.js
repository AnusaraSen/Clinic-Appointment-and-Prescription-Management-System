// Simple global event + localStorage cache for prescription status updates

const EVENT_NAME = 'prescriptionUpdated';
const LS_KEY = 'prescriptionStatusOverrides';
const DISPENSE_LS_KEY = 'prescriptionDispenseOverrides';

function readOverrides() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(map) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    // ignore quota or serialization errors
  }
}

export function getAllStatusOverrides() {
  return readOverrides();
}

export function getStatusOverride(id) {
  const map = readOverrides();
  return map?.[id];
}

export function setStatusOverride(id, status) {
  const map = readOverrides();
  map[id] = status;
  writeOverrides(map);
}

export function emitPrescriptionUpdated(payload) {
  // payload shape: { id: string, status: string, lastDispensed?: string, dispensedBy?: string }
  if (payload?.id && payload?.status) {
    setStatusOverride(payload.id, payload.status);
  }
  const event = new CustomEvent(EVENT_NAME, { detail: payload });
  window.dispatchEvent(event);
}

// Medicine-level dispense overrides (per prescription)
function readDispenseMap() {
  try {
    const raw = localStorage.getItem(DISPENSE_LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDispenseMap(map) {
  try {
    localStorage.setItem(DISPENSE_LS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getDispenseOverride(prescriptionId, medicineName) {
  const map = readDispenseMap();
  return map?.[prescriptionId]?.[medicineName];
}

export function setDispenseOverride(prescriptionId, medicineName, payload) {
  const map = readDispenseMap();
  if (!map[prescriptionId]) map[prescriptionId] = {};
  map[prescriptionId][medicineName] = payload; // { dispensed, status }
  writeDispenseMap(map);
}

export function clearDispenseOverridesForPrescription(prescriptionId) {
  const map = readDispenseMap();
  if (map[prescriptionId]) {
    delete map[prescriptionId];
    writeDispenseMap(map);
  }
}
