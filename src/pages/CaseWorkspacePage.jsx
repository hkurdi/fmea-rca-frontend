import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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

const tabItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'processMap', label: 'FMEA Process Map' },
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

function SectionActions({ sectionKey, saveStatus, isLocked, onSave, onSubmit }) {
  const locked = isLocked[sectionKey];
  const status = saveStatus[sectionKey];

  return (
    <div className="flex items-center gap-3 mt-2 mb-4">
      {locked ? (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          ✓ Submitted
        </span>
      ) : (
        <>
          <button
            onClick={() => onSave(sectionKey)}
            disabled={status === 'saving'}
            className="rounded-xl border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {status === 'saving' ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => onSubmit(sectionKey)}
            disabled={status === 'saving'}
            className="rounded-xl bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Submit for Scoring
          </button>
          {status === 'saved' && (
            <span className="text-xs text-emerald-600 font-medium">Saved</span>
          )}
          {status === 'error' && (
            <span className="text-xs text-red-600 font-medium">Save failed</span>
          )}
        </>
      )}
    </div>
  );
}

export default function CaseWorkspacePage() {
  const { caseId } = useParams();
  const { courseId } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [caseItem, setCaseItem] = useState(null);
  const [caseLoading, setCaseLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

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

  const handleSave = async (type) => {
    setActionMsg('');
    try {
      await saveSection(type);
      setActionMsg(`${SECTION_LABELS[type]} saved.`);
    } catch (err) {
      setActionMsg(`Save failed: ${err.message}`);
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleSubmit = async (type) => {
    setActionMsg('');
    try {
      await submitSection(type, courseId);
      setActionMsg(`${SECTION_LABELS[type]} submitted for scoring!`);
    } catch (err) {
      setActionMsg(`Submit failed: ${err.message}`);
    }
    setTimeout(() => setActionMsg(''), 5000);
  };

  if (isLoading || caseLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading workspace...</p>
      </div>
    );
  }

  if (!caseItem) {
    return <div className="card">Case not found.</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card">
              <h3 className="text-lg font-semibold">Patient Information</h3>
              {caseItem.patient_info && Object.keys(caseItem.patient_info).length > 0 ? (
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {Object.entries(caseItem.patient_info).map(([key, val]) => (
                    <div key={key}>
                      <span className="font-medium capitalize text-slate-700">{key}:</span>{' '}
                      {typeof val === 'string' ? val : JSON.stringify(val)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No patient info provided.</p>
              )}
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold">Deliverables</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {SECTIONS.map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className={isLocked[s] ? 'text-emerald-600' : 'text-slate-400'}>
                      {isLocked[s] ? '✓' : '○'}
                    </span>
                    {SECTION_LABELS[s]}
                  </li>
                ))}
              </ul>
              {!courseId && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  No course assigned yet. Submissions require a course. Ask your instructor.
                </p>
              )}
            </div>
          </div>
        );

      case 'processMap':
        return (
          <>
            <SectionActions sectionKey="processMap" saveStatus={saveStatus} isLocked={isLocked} onSave={handleSave} onSubmit={handleSubmit} />
            <ProcessMapEditor value={workspace.processMap} onChange={(next) => updateSection('processMap', next)} readOnly={isLocked.processMap} />
          </>
        );

      case 'hazardAnalysis':
        return (
          <>
            <SectionActions sectionKey="hazardAnalysis" saveStatus={saveStatus} isLocked={isLocked} onSave={handleSave} onSubmit={handleSubmit} />
            <HazardAnalysisTable rows={workspace.hazardAnalysis} onChange={(next) => updateSection('hazardAnalysis', next)} readOnly={isLocked.hazardAnalysis} />
          </>
        );

      case 'fmeaPip':
        return (
          <>
            <SectionActions sectionKey="fmeaPip" saveStatus={saveStatus} isLocked={isLocked} onSave={handleSave} onSubmit={handleSubmit} />
            <PipForm title="FMEA Performance Improvement Plan" value={workspace.fmeaPip} onChange={(next) => updateSection('fmeaPip', next)} includeRationale readOnly={isLocked.fmeaPip} />
          </>
        );

      case 'fishbone':
        return (
          <>
            <SectionActions sectionKey="fishbone" saveStatus={saveStatus} isLocked={isLocked} onSave={handleSave} onSubmit={handleSubmit} />
            <FishboneEditor value={workspace.fishbone} onChange={(next) => updateSection('fishbone', next)} readOnly={isLocked.fishbone} />
          </>
        );

      case 'fiveWhys':
        return (
          <>
            <SectionActions sectionKey="fiveWhys" saveStatus={saveStatus} isLocked={isLocked} onSave={handleSave} onSubmit={handleSubmit} />
            <FiveWhysEditor value={workspace.fiveWhys} onChange={(next) => updateSection('fiveWhys', next)} readOnly={isLocked.fiveWhys} />
          </>
        );

      case 'rcaPip':
        return (
          <>
            <SectionActions sectionKey="rcaPip" saveStatus={saveStatus} isLocked={isLocked} onSave={handleSave} onSubmit={handleSubmit} />
            <PipForm title="RCA Performance Improvement Plan" value={workspace.rcaPip} onChange={(next) => updateSection('rcaPip', next)} readOnly={isLocked.rcaPip} />
          </>
        );

      case 'summary':
        return <WorkspaceSummary workspace={workspace} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
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

      {actionMsg && (
        <div className={`rounded-xl px-4 py-2 text-sm font-medium ${
          actionMsg.includes('failed') || actionMsg.includes('Failed')
            ? 'bg-red-50 text-red-700'
            : 'bg-emerald-50 text-emerald-700'
        }`}>
          {actionMsg}
        </div>
      )}

      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
      {renderContent()}
    </div>
  );
}