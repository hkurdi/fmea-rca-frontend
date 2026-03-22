export function calculateEarnedPoints(workspace) {
  let total = 0;

  if (workspace.processMap?.sections?.length > 0) {
    total += 30;
  }

  if (workspace.hazardAnalysis?.length > 0) {
    total += 16;
  }

  if (workspace.fishbone?.problemStatement) {
    total += 40;
  }

  if (workspace.fiveWhys?.problem) {
    total += 4;
  }

  if (workspace.fmeaPip?.problem) {
    total += 5;
  }

  if (workspace.rcaPip?.problem) {
    total += 5;
  }

  return total;
}