import { useCallback, useEffect, useRef, useState } from 'react';
import { casesApi } from '../api/cases';
import { scoringApi } from '../api/scoring';
import {
  defaultFishbone,
  defaultFiveWhys,
  defaultFmeaPip,
  defaultHazardRows,
  defaultProcessMap,
  defaultRcaPip,
} from '../data/mockData';

function buildDefault() {
  return {
    processMap: structuredClone(defaultProcessMap),
    hazardAnalysis: structuredClone(defaultHazardRows),
    fmeaPip: structuredClone(defaultFmeaPip),
    fishbone: structuredClone(defaultFishbone),
    fiveWhys: structuredClone(defaultFiveWhys),
    rcaPip: structuredClone(defaultRcaPip),
  };
}

function fiveWhysToApi(fiveWhys) {
  const iterations = {};
  (fiveWhys.iterations || []).forEach((item, idx) => {
    iterations[`why${idx + 1}`] = {
      question: item.why || `Why ${idx + 1}?`,
      answer: item.answer || '',
    };
  });
  return { problem: fiveWhys.problem || '', iterations };
}

function fiveWhysFromApi(data) {
  const iterations = Object.entries(data.iterations || {}).map(([key, val]) => ({
    id: crypto.randomUUID(),
    why: val.question || key,
    answer: val.answer || '',
  }));
  if (iterations.length === 0) return structuredClone(defaultFiveWhys);
  return { problem: data.problem || '', iterations };
}

const FISHBONE_TREE_KEY = (caseId) => `fishbone_tree_${caseId}`;

function saveFishboneTreeLocally(caseId, majorCauses) {
  try { localStorage.setItem(FISHBONE_TREE_KEY(caseId), JSON.stringify(majorCauses)); } catch {}
}

function loadFishboneTreeLocally(caseId) {
  try {
    const raw = localStorage.getItem(FISHBONE_TREE_KEY(caseId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function useWorkspace(caseId) {
  const [workspace, setWorkspace] = useState(buildDefault());
  const [isLocked, setIsLocked] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({});

  // useRef so saveSection always reads the latest ID without stale closures
  const submissionIdsRef = useRef({});

  const setSubmissionId = useCallback((type, id) => {
    submissionIdsRef.current = { ...submissionIdsRef.current, [type]: id };
  }, []);

  const loadWorkspace = useCallback(async () => {
    if (!caseId) return;
    setIsLoading(true);

    const newWorkspace = buildDefault();
    const newLocked = {};

    // Each fetch returns null on 404 (not created yet) — that's fine, workspace starts blank
    await Promise.allSettled([
      casesApi.getProcessMap(caseId).then((res) => {
        if (!res) return;
        newWorkspace.processMap = res.data.content || defaultProcessMap;
        setSubmissionId('processMap', res.data.id);
        newLocked.processMap = res.data.is_locked;
      }),

      casesApi.getHazardAnalysis(caseId).then((res) => {
        if (!res) return;
        newWorkspace.hazardAnalysis = res.data.rows?.rows || defaultHazardRows;
        setSubmissionId('hazardAnalysis', res.data.id);
        newLocked.hazardAnalysis = res.data.is_locked;
      }),

      casesApi.getFmeaPip(caseId).then((res) => {
        if (!res) return;
        newWorkspace.fmeaPip = res.data.content || defaultFmeaPip;
        setSubmissionId('fmeaPip', res.data.id);
        newLocked.fmeaPip = res.data.is_locked;
      }),

      casesApi.getFishbone(caseId).then((res) => {
        if (!res) return;
        setSubmissionId('fishbone', res.data.id);
        newLocked.fishbone = res.data.is_locked;
        const savedTree = loadFishboneTreeLocally(caseId) || defaultFishbone.majorCauses;
        newWorkspace.fishbone = {
          problemStatement: res.data.problem_statement || '',
          majorCauses: savedTree,
        };
      }),

      casesApi.getFiveWhys(caseId).then((res) => {
        if (!res) return;
        newWorkspace.fiveWhys = fiveWhysFromApi(res.data);
        setSubmissionId('fiveWhys', res.data.id);
        newLocked.fiveWhys = res.data.is_locked;
      }),

      casesApi.getRcaPip(caseId).then((res) => {
        if (!res) return;
        newWorkspace.rcaPip = res.data.content || defaultRcaPip;
        setSubmissionId('rcaPip', res.data.id);
        newLocked.rcaPip = res.data.is_locked;
      }),
    ]);

    setWorkspace(newWorkspace);
    setIsLocked(newLocked);
    setIsLoading(false);
  }, [caseId, setSubmissionId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const updateSection = useCallback((type, value) => {
    setWorkspace((prev) => ({ ...prev, [type]: value }));
    if (type === 'fishbone') {
      saveFishboneTreeLocally(caseId, value.majorCauses);
    }
  }, [caseId]);

  // Returns the submission ID — either existing or newly created
  const saveSection = useCallback(async (type) => {
    const data = workspace[type];
    const existingId = submissionIdsRef.current[type];

    setSaveStatus((p) => ({ ...p, [type]: 'saving' }));

    try {
      let res;
      let finalId = existingId;

      switch (type) {
        case 'processMap':
          if (existingId) {
            res = await casesApi.updateProcessMap(caseId, existingId, data);
          } else {
            res = await casesApi.createProcessMap(caseId, data);
            finalId = res.data.id;
            setSubmissionId('processMap', finalId);
          }
          break;

        case 'hazardAnalysis':
          if (existingId) {
            res = await casesApi.updateHazardAnalysis(caseId, existingId, { rows: data });
          } else {
            res = await casesApi.createHazardAnalysis(caseId, { rows: data });
            finalId = res.data.id;
            setSubmissionId('hazardAnalysis', finalId);
          }
          break;

        case 'fmeaPip':
          if (existingId) {
            res = await casesApi.updateFmeaPip(caseId, existingId, data);
          } else {
            res = await casesApi.createFmeaPip(caseId, data);
            finalId = res.data.id;
            setSubmissionId('fmeaPip', finalId);
          }
          break;

        case 'fishbone':
          saveFishboneTreeLocally(caseId, data.majorCauses);
          if (existingId) {
            res = await casesApi.updateFishbone(caseId, data.problemStatement);
          } else {
            res = await casesApi.createFishbone(caseId, data.problemStatement);
            finalId = res.data.id;
            setSubmissionId('fishbone', finalId);
          }
          break;

        case 'fiveWhys': {
          const { problem, iterations } = fiveWhysToApi(data);
          if (existingId) {
            res = await casesApi.updateFiveWhys(caseId, problem, iterations);
          } else {
            res = await casesApi.createFiveWhys(caseId, problem, iterations);
            finalId = res.data.id;
            setSubmissionId('fiveWhys', finalId);
          }
          break;
        }

        case 'rcaPip':
          if (existingId) {
            res = await casesApi.updateRcaPip(caseId, existingId, data);
          } else {
            res = await casesApi.createRcaPip(caseId, data);
            finalId = res.data.id;
            setSubmissionId('rcaPip', finalId);
          }
          break;

        default:
          throw new Error(`Unknown section: ${type}`);
      }

      setSaveStatus((p) => ({ ...p, [type]: 'saved' }));
      return finalId;
    } catch (err) {
      setSaveStatus((p) => ({ ...p, [type]: 'error' }));
      throw err;
    }
  }, [workspace, caseId, setSubmissionId]);

  // Saves first, uses returned ID directly — never reads stale state
  const submitSection = useCallback(async (type, courseId) => {
    if (!courseId) throw new Error('No course assigned. Ask your instructor to create a course.');

    const submissionId = await saveSection(type);
    if (!submissionId) throw new Error('Could not get submission ID after save.');

    const submitFnMap = {
      processMap: scoringApi.submitProcessMap,
      hazardAnalysis: scoringApi.submitHazardAnalysis,
      fmeaPip: scoringApi.submitFmeaPip,
      fishbone: scoringApi.submitFishbone,
      fiveWhys: scoringApi.submitFiveWhys,
      rcaPip: scoringApi.submitRcaPip,
    };

    const res = await submitFnMap[type](submissionId, courseId);
    setIsLocked((p) => ({ ...p, [type]: true }));
    return res;
  }, [saveSection]);

  const resetWorkspace = useCallback(() => {
    const defaults = buildDefault();

    // Clear submission IDs for all unlocked sections first (outside setState)
    Object.keys(defaults).forEach((key) => {
      if (!isLocked[key]) {
        delete submissionIdsRef.current[key];
      }
    });

    // Clear fishbone tree from localStorage if fishbone isn't locked
    if (!isLocked.fishbone) {
      try { localStorage.removeItem(FISHBONE_TREE_KEY(caseId)); } catch {}
    }

    // Reset workspace state — locked sections keep their current values
    setWorkspace((prev) => {
      const next = { ...prev };
      Object.keys(defaults).forEach((key) => {
        if (!isLocked[key]) {
          next[key] = defaults[key];
        }
      });
      return next;
    });

    setSaveStatus({});
  }, [caseId, isLocked]);

  return {
    workspace,
    isLocked,
    isLoading,
    saveStatus,
    updateSection,
    saveSection,
    submitSection,
    resetWorkspace,
  };
}