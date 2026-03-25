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

function nodesFromApi(nodes) {
  if (!nodes || nodes.length === 0) return null;

  const byBackendId = {};
  nodes.forEach((n) => {
    byBackendId[n.id] = {
      id: crypto.randomUUID(),
      backendId: n.id,
      label: n.label,
      _level: n.level,
      _parentBackendId: n.parent_id,
      order_index: n.order_index,
      primaryCauses: [],
      secondaryCauses: [],
      tertiaryCauses: [],
    };
  });

  const majors = [];
  const primaries = [];
  const secondaries = [];
  const tertiaries = [];

  Object.values(byBackendId).forEach((node) => {
    if (node._level === 'major') majors.push(node);
    else if (node._level === 'primary') primaries.push(node);
    else if (node._level === 'secondary') secondaries.push(node);
    else if (node._level === 'tertiary') tertiaries.push(node);
  });

  tertiaries.forEach((t) => {
    const parent = byBackendId[t._parentBackendId];
    if (parent) parent.tertiaryCauses.push(t);
  });

  secondaries.forEach((s) => {
    const parent = byBackendId[s._parentBackendId];
    if (parent) parent.secondaryCauses.push(s);
  });

  primaries.forEach((p) => {
    const parent = byBackendId[p._parentBackendId];
    if (parent) parent.primaryCauses.push(p);
  });

  const sort = (arr) => [...arr].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return sort(majors).map((m) => ({
    ...m,
    primaryCauses: sort(m.primaryCauses).map((p) => ({
      ...p,
      secondaryCauses: sort(p.secondaryCauses).map((s) => ({
        ...s,
        tertiaryCauses: sort(s.tertiaryCauses),
      })),
    })),
  }));
}

async function syncFishboneNodes(caseId, fishboneId, majorCauses) {
  const updated = JSON.parse(JSON.stringify(majorCauses));

  for (let mIdx = 0; mIdx < updated.length; mIdx++) {
    const major = updated[mIdx];
    if (!major.backendId) {
      const res = await casesApi.addFishboneNode(caseId, fishboneId, {
        label: major.label,
        level: 'major',
        order_index: mIdx,
      });
      major.backendId = res.data.id;
    }

    for (let pIdx = 0; pIdx < (major.primaryCauses || []).length; pIdx++) {
      const primary = major.primaryCauses[pIdx];
      if (!primary.backendId) {
        const res = await casesApi.addFishboneNode(caseId, fishboneId, {
          label: primary.label,
          level: 'primary',
          parent_id: major.backendId,
          order_index: pIdx,
        });
        primary.backendId = res.data.id;
      }

      for (let sIdx = 0; sIdx < (primary.secondaryCauses || []).length; sIdx++) {
        const secondary = primary.secondaryCauses[sIdx];
        if (!secondary.backendId) {
          const res = await casesApi.addFishboneNode(caseId, fishboneId, {
            label: secondary.label,
            level: 'secondary',
            parent_id: primary.backendId,
            order_index: sIdx,
          });
          secondary.backendId = res.data.id;
        }

        for (let tIdx = 0; tIdx < (secondary.tertiaryCauses || []).length; tIdx++) {
          const tertiary = secondary.tertiaryCauses[tIdx];
          if (!tertiary.backendId) {
            const res = await casesApi.addFishboneNode(caseId, fishboneId, {
              label: tertiary.label,
              level: 'tertiary',
              parent_id: secondary.backendId,
              order_index: tIdx,
            });
            tertiary.backendId = res.data.id;
          }
        }
      }
    }
  }

  return updated;
}

export function useWorkspace(caseId) {
  const [workspace, setWorkspace] = useState(buildDefault());
  const [isLocked, setIsLocked] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({});

  const submissionIdsRef = useRef({});

  const setSubmissionId = useCallback((type, id) => {
    submissionIdsRef.current = { ...submissionIdsRef.current, [type]: id };
  }, []);

  const loadWorkspace = useCallback(async () => {
    if (!caseId) return;
    setIsLoading(true);

    const newWorkspace = buildDefault();
    const newLocked = {};

    await Promise.allSettled([
      casesApi.getProcessMap(caseId).then((res) => {
        if (!res) return;
        newWorkspace.processMap = res.data.content || defaultProcessMap;
        setSubmissionId('processMap', res.data.id);
        newLocked.processMap = res.data.is_locked;
      }),

      casesApi.getHazardAnalysis(caseId).then((res) => {
        if (!res) return;
        const raw = res.data.rows;
        newWorkspace.hazardAnalysis = Array.isArray(raw)
          ? raw
          : (raw?.rows || defaultHazardRows);
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
        const nodesTree = nodesFromApi(res.data.nodes);
        newWorkspace.fishbone = {
          problemStatement: res.data.problem_statement || '',
          majorCauses: nodesTree || defaultFishbone.majorCauses,
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
  }, []);

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
          const payload = {
            rows: data,
          };
          if (existingId) {
            res = await casesApi.updateHazardAnalysis(caseId, existingId, payload);
          } else {
            res = await casesApi.createHazardAnalysis(caseId, payload);
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

        case 'fishbone': {
          if (existingId) {
            res = await casesApi.updateFishbone(caseId, data.problemStatement);
          } else {
            res = await casesApi.createFishbone(caseId, data.problemStatement);
            finalId = res.data.id;
            setSubmissionId('fishbone', finalId);
          }
          const updatedMajorCauses = await syncFishboneNodes(caseId, finalId, data.majorCauses);
          setWorkspace((prev) => ({
            ...prev,
            fishbone: { ...prev.fishbone, majorCauses: updatedMajorCauses },
          }));
          break;
        }

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

    Object.keys(defaults).forEach((key) => {
      if (!isLocked[key]) {
        delete submissionIdsRef.current[key];
      }
    });

    setWorkspace((prev) => {
      const next = { ...prev };
      Object.keys(defaults).forEach((key) => {
        if (!isLocked[key]) next[key] = defaults[key];
      });
      return next;
    });

    setSaveStatus({});
  }, [isLocked]);

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