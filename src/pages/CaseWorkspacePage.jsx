import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Tabs from '../components/Tabs';
import WorkspaceHeader from '../components/WorkspaceHeader';
import ProcessMapEditor from '../components/ProcessMapEditor';
import HazardAnalysisTable from '../components/HazardAnalysisTable';
import PipForm from '../components/PipForm';
import FishboneEditor from '../components/FishboneEditor';
import FiveWhysEditor from '../components/FiveWhysEditor';
import WorkspaceSummary from '../components/WorkspaceSummary';
import { useWorkspace } from '../hooks/useWorkspace';
import { useAuth } from '../context/AuthContext';
import { casesApi } from '../api/cases';
import { isSectionReady, SECTION_HINTS } from '../utils/sectionValidation';

const tabItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'processMap', label: 'Process Map' },
  { key: 'hazardAnalysis', label: 'Hazard Analysis' },
  { key: 'fmeaPip', label: 'FMEA PIP' },
  { key: 'fishbone', label: 'Fishbone' },
  { key: 'fiveWhys', label: '5 Whys' },
  { key: 'rcaPip', label: 'RCA PIP' },
  { key: 'summary', label: 'Summary' },
];

const SECTIONS = ['processMap', 'hazardAnalysis', 'fmeaPip', 'fishbone', 'fiveWhys', 'rcaPip'];

const SECTION_LABELS = {
  processMap: 'Process Map',
  hazardAnalysis: 'Hazard Analysis',
  fmeaPip: 'FMEA PIP',
  fishbone: 'Fishbone',
  fiveWhys: '5 Whys',
  rcaPip: 'RCA PIP',
};

const formatKey = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function renderValue(val) {
  if (Array.isArray(val)) {
    return (
      <ul className="mt-1 space-y-1 pl-4">
        {val.map((v, i) => (
          <li key={i} className="text-sm text-slate-400 list-disc">{String(v)}</li>
        ))}
      </ul>
    );
  }
  if (typeof val === 'object' && val !== null) {
    return (
      <div className="mt-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2">
        {Object.entries(val).map(([k, v]) => (
          <div key={k}>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{formatKey(k)}</p>
            <p className="text-sm text-slate-400">{String(v)}</p>
          </div>
        ))}
      </div>
    );
  }
  return <p className="mt-1 text-sm text-slate-400 break-words">{String(val)}</p>;
}

function PatientInfoCard({ info }) {
  if (!info || Object.keys(info).length === 0) {
    return (
      <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-6 text-center">
        <p className="text-sm text-slate-600">No patient info provided.</p>
      </div>
    );
  }

  const sorted = Object.entries(info).sort(([, a], [, b]) => {
    const rank = (v) => (Array.isArray(v) ? 1 : typeof v === 'object' && v !== null ? 2 : 0);
    return rank(a) - rank(b);
  });

  return (
    <div className="mt-3 space-y-4">
      {sorted.map(([key, val]) => (
        <div key={key}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{formatKey(key)}</p>
          {renderValue(val)}
        </div>
      ))}
    </div>
  );
}

function SectionActions({ sectionKey, saveStatus, isLocked, workspace, onSave, onSubmit }) {
  const locked = isLocked[sectionKey];
  const status = saveStatus[sectionKey];
  const ready = isSectionReady(sectionKey, workspace);
  const hint = SECTION_HINTS[sectionKey];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5 min-w-0">
      {locked ? (
        <span className="badge badge-emerald">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Submitted
        </span>
      ) : (
        <>
          <button
            onClick={() => onSave(sectionKey)}
            disabled={status === 'saving'}
            className="btn-secondary text-xs py-2 px-3"
          >
            {status === 'saving' ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                Save
              </>
            )}
          </button>
          <button
            onClick={() => onSubmit(sectionKey)}
            disabled={status === 'saving' || !ready}
            title={!ready ? hint : ''}
            className="btn-primary text-xs py-2 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit for Scoring
          </button>
          <AnimatePresence>
            {status === 'saved' && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-teal font-medium flex items-center gap-1"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Saved
              </motion.span>
            )}
            {status === 'error' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-400 font-medium"
              >
                Save failed
              </motion.span>
            )}
          </AnimatePresence>
          {!ready && (
            <span className="text-xs text-amber-500 font-medium">{hint}</span>
          )}
        </>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-white/[0.06]" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-t-teal animate-spin" />
      </div>
      <p className="text-sm text-slate-500">Loading workspace...</p>
    </div>
  );
}

export default function CaseWorkspacePage() {
  const { caseId } = useParams();
  const { courseId } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [caseItem, setCaseItem] = useState(null);
  const [caseLoading, setCaseLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });

  const {
    workspace,
    isLocked,
    isLoading,
    saveStatus,
    updateSection,
    saveSection,
    submitSection,
    resetWorkspace,
  } = useWorkspace(caseId);

  useEffect(() => {
    setCaseLoading(true);
    casesApi
      .getById(caseId)
      .then((res) => { if (res) setCaseItem(res.data); })
      .catch(() => {})
      .finally(() => setCaseLoading(false));
  }, [caseId]);

  const progress = useMemo(() => {
    const submitted = SECTIONS.filter((s) => isLocked[s]).length;
    return Math.round((submitted / SECTIONS.length) * 100);
  }, [isLocked]);

  const showMsg = (text, type = 'success') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg({ text: '', type: '' }), 4000);
  };

  const handleSave = async (type) => {
    try {
      await saveSection(type);
      showMsg(`${SECTION_LABELS[type]} saved.`, 'success');
    } catch (err) {
      showMsg(`Save failed: ${err.message}`, 'error');
    }
  };

  const handleSubmit = async (type) => {
    try {
      await submitSection(type, courseId);
      showMsg(`${SECTION_LABELS[type]} submitted for scoring!`, 'success');
    } catch (err) {
      showMsg(`Submit failed: ${err.message}`, 'error');
    }
  };

  if (isLoading || caseLoading) return <LoadingSpinner />;

  if (!caseItem) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-500">Case not found.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-5 lg:grid-cols-2"
          >
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-teal">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Patient Information
              </h3>
              <PatientInfoCard info={caseItem.patient_info} />
            </div>
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-teal">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Deliverables
              </h3>
              <ul className="mt-4 space-y-2">
                {SECTIONS.map((s) => (
                  <li key={s} className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/[0.03] border border-white/[0.05]">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                      isLocked[s]
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/[0.06] text-slate-600'
                    }`}>
                      {isLocked[s] ? '✓' : '○'}
                    </span>
                    <span className={`text-sm ${isLocked[s] ? 'text-slate-300' : 'text-slate-500'}`}>
                      {SECTION_LABELS[s]}
                    </span>
                    {isLocked[s] && (
                      <span className="ml-auto badge badge-emerald text-[10px] py-0.5">Done</span>
                    )}
                  </li>
                ))}
              </ul>
              {!courseId && (
                <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
                  No course assigned yet. Submissions require a course — ask your instructor.
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'processMap':
        return (
          <motion.div key="processMap" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <SectionActions sectionKey="processMap" saveStatus={saveStatus} isLocked={isLocked} workspace={workspace} onSave={handleSave} onSubmit={handleSubmit} />
            <ProcessMapEditor value={workspace.processMap} onChange={(next) => updateSection('processMap', next)} readOnly={isLocked.processMap} />
          </motion.div>
        );

      case 'hazardAnalysis':
        return (
          <motion.div key="hazardAnalysis" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <SectionActions sectionKey="hazardAnalysis" saveStatus={saveStatus} isLocked={isLocked} workspace={workspace} onSave={handleSave} onSubmit={handleSubmit} />
            <HazardAnalysisTable rows={workspace.hazardAnalysis} onChange={(next) => updateSection('hazardAnalysis', next)} readOnly={isLocked.hazardAnalysis} />
          </motion.div>
        );

      case 'fmeaPip':
        return (
          <motion.div key="fmeaPip" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <SectionActions sectionKey="fmeaPip" saveStatus={saveStatus} isLocked={isLocked} workspace={workspace} onSave={handleSave} onSubmit={handleSubmit} />
            <PipForm title="FMEA Performance Improvement Plan" value={workspace.fmeaPip} onChange={(next) => updateSection('fmeaPip', next)} includeRationale readOnly={isLocked.fmeaPip} />
          </motion.div>
        );

      case 'fishbone':
        return (
          <motion.div key="fishbone" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <SectionActions sectionKey="fishbone" saveStatus={saveStatus} isLocked={isLocked} workspace={workspace} onSave={handleSave} onSubmit={handleSubmit} />
            <FishboneEditor value={workspace.fishbone} onChange={(next) => updateSection('fishbone', next)} readOnly={isLocked.fishbone} />
          </motion.div>
        );

      case 'fiveWhys':
        return (
          <motion.div key="fiveWhys" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <SectionActions sectionKey="fiveWhys" saveStatus={saveStatus} isLocked={isLocked} workspace={workspace} onSave={handleSave} onSubmit={handleSubmit} />
            <FiveWhysEditor value={workspace.fiveWhys} onChange={(next) => updateSection('fiveWhys', next)} readOnly={isLocked.fiveWhys} />
          </motion.div>
        );

      case 'rcaPip':
        return (
          <motion.div key="rcaPip" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <SectionActions sectionKey="rcaPip" saveStatus={saveStatus} isLocked={isLocked} workspace={workspace} onSave={handleSave} onSubmit={handleSubmit} />
            <PipForm title="RCA Performance Improvement Plan" value={workspace.rcaPip} onChange={(next) => updateSection('rcaPip', next)} readOnly={isLocked.rcaPip} />
          </motion.div>
        );

      case 'summary':
        return (
          <motion.div key="summary" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <WorkspaceSummary workspace={workspace} isLocked={isLocked} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <WorkspaceHeader
        item={caseItem}
        progress={progress}
        onReset={() => {
          const hasLocked = Object.values(isLocked).some(Boolean);
          const msg = hasLocked
            ? 'Reset all unsaved sections to blank? Submitted sections will stay locked.'
            : 'Reset all sections to blank? This cannot be undone.';
          if (window.confirm(msg)) resetWorkspace();
        }}
      />

      <AnimatePresence>
        {actionMsg.text && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              actionMsg.type === 'error'
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-teal/10 border border-teal/20 text-teal-bright'
            }`}
          >
            {actionMsg.type === 'error' ? (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {actionMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}
