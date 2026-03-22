export const mockUser = {
  id: 1,
  name: 'Pearl Patel',
  role: 'student',
  email: 'pearl@example.com',
  points: 32,
};

export const mockCases = [
  {
    id: 1,
    title: 'Medication History in the ER',
    description:
      'Practice FMEA and RCA on medication history, reconciliation, and patient safety gaps across normal hours and after-hours workflows.',
    mode: 'exercise',
    allow_resubmit: true,
    is_active: true,
    patient_info: {
      name: 'Travis Whitaker',
      age: 68,
      summary:
        'Presented with CHF exacerbation, CKD, T2DM, and incomplete medication history during an overnight ER intake.',
      details: [
        'ER Pharmacy Satellite follows standardized protocol from 0700 to 2300.',
        'After hours, nurses obtain medication histories without a standard protocol.',
        'Medication reconciliation and monitoring issues later contributed to elevated potassium and safety risk.',
      ],
    },
  },
  {
    id: 2,
    title: 'Inpatient Transfer and Monitoring Review',
    description:
      'Analyze the transition from ER to cardiac unit, identify communication failures, and build RCA deliverables.',
    mode: 'assessment',
    allow_resubmit: false,
    is_active: true,
    patient_info: {
      name: 'Travis Whitaker',
      age: 68,
      summary:
        'Transferred to the cardiac unit with medication and lab monitoring decisions that require close review.',
      details: [
        'Focus on fishbone diagram, 5 Whys, and RCA performance improvement planning.',
        'Assessment mode is kept read-only after final submission in the planned backend flow.',
      ],
    },
  },
];

export const defaultProcessMap = {
  sections: [
    {
      id: crypto.randomUUID(),
      title: '',
      type: 'major',
      shouldHappen: '',
      drift: '',
      tasks: [
        {
          id: crypto.randomUUID(),
          title: '',
          type: 'subprocess',
          shouldHappen: '',
          drift: '',
        },
      ],
    },
  ],
};

export const defaultHazardRows = [
  {
    id: crypto.randomUUID(),
    majorProcess: '',
    subProcess: '',
    failureMode: '',
    failureCause: '',
    failureEffect: '',
    occurrence: 1,
    detection: 1,
    severity: 1,
    action: '',
  },
];

export const defaultFmeaPip = {
  problem: '',
  rationale: '',
  plan: '',
  resources: '',
  timeline: '',
  successMeasure: '',
};

export const defaultFishbone = {
  problemStatement: '',
  majorCauses: Array.from({ length: 5 }).map((_, index) => ({
    id: crypto.randomUUID(),
    label: `Major Cause ${index + 1}`,
    primaryCauses: Array.from({ length: 2 }).map((__, pIndex) => ({
      id: crypto.randomUUID(),
      label: `Primary Cause ${pIndex + 1}`,
      secondaryCauses: Array.from({ length: 2 }).map((___, sIndex) => ({
        id: crypto.randomUUID(),
        label: `Secondary Cause ${sIndex + 1}`,
        tertiaryCauses: Array.from({ length: 2 }).map((____, tIndex) => ({
          id: crypto.randomUUID(),
          label: `Tertiary Cause ${tIndex + 1}`,
        })),
      })),
    })),
  })),
};

export const defaultFiveWhys = {
  problem: '',
  iterations: Array.from({ length: 5 }).map((_, index) => ({
    id: crypto.randomUUID(),
    why: `Why ${index + 1}?`,
    answer: '',
  })),
};

export const defaultRcaPip = {
  problem: '',
  plan: '',
  resources: '',
  timeline: '',
  successMeasure: '',
};

export const rubricPoints = {
  processMap: 30,
  hazardAnalysis: 16,
  fishbone: 40,
  fiveWhys: 4,
  fmeaPip: 5,
  rcaPip: 5,
};
