const STORAGE_KEY = 'fmea_rca_frontend_demo';

export function loadWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWorkspace(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
