export function calculateRpn(row) {
  return Number(row.occurrence || 0) * Number(row.detection || 0) * Number(row.severity || 0);
}

export function getModeClasses(mode) {
  return mode === 'assessment'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-emerald-100 text-emerald-700';
}

export function getProgress(workspace) {
  const checks = [
    workspace?.processMap?.sections?.some((item) => item.title.trim()),
    workspace?.hazardAnalysis?.some((row) => row.failureMode.trim()),
    workspace?.fmeaPip?.problem?.trim(),
    workspace?.fishbone?.problemStatement?.trim(),
    workspace?.fiveWhys?.problem?.trim(),
    workspace?.rcaPip?.problem?.trim(),
  ];

  const complete = checks.filter(Boolean).length;
  return Math.round((complete / checks.length) * 100);
}
