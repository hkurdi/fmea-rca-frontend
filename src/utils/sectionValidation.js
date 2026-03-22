export function isSectionReady(type, workspace) {
  switch (type) {
    case 'processMap': {
      const sections = workspace.processMap?.sections || [];
      return sections.length > 0 && sections.some((s) => s.title?.trim());
    }
    case 'hazardAnalysis': {
      const rows = workspace.hazardAnalysis || [];
      return rows.length > 0 && rows.some((r) => r.failureMode?.trim());
    }
    case 'fmeaPip': {
      const pip = workspace.fmeaPip || {};
      return !!(pip.problem?.trim() && pip.plan?.trim());
    }
    case 'fishbone': {
      return !!(workspace.fishbone?.problemStatement?.trim());
    }
    case 'fiveWhys': {
      const fw = workspace.fiveWhys || {};
      if (!fw.problem?.trim()) return false;
      return (fw.iterations || []).some((i) => i.answer?.trim());
    }
    case 'rcaPip': {
      const pip = workspace.rcaPip || {};
      return !!(pip.problem?.trim() && pip.plan?.trim());
    }
    default:
      return false;
  }
}

export const SECTION_HINTS = {
  processMap: 'Add at least one section with a title before submitting.',
  hazardAnalysis: 'Add at least one row with a failure mode before submitting.',
  fmeaPip: 'Fill in the problem statement and improvement plan before submitting.',
  fishbone: 'Fill in the problem statement before submitting.',
  fiveWhys: 'Fill in the problem and at least one answer before submitting.',
  rcaPip: 'Fill in the problem statement and improvement plan before submitting.',
};