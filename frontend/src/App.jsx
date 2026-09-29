import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import WorkflowSteps from './components/WorkflowSteps';
import IncidentForm from './components/IncidentForm';
import InvestigationReport from './components/InvestigationReport';
import ResolutionModal from './components/ResolutionModal';
import MemoryBankViewer from './components/MemoryBankViewer';
import SettingsModal from './components/SettingsModal';
import MemoryKnowledgeGraph from './components/MemoryKnowledgeGraph';
import HistoricalIncidentsView from './components/HistoricalIncidentsView';
import MemoryCompareModal from './components/MemoryCompareModal';
import ActivityHistoryDrawer from './components/ActivityHistoryDrawer';
import { 
  checkHealth, 
  analyzeIncident, 
  compareIncident,
  previewRecall, 
  resolveIncident, 
  getIncidents, 
  seedHistoricalMemories 
} from './services/api';
import { 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [previewMemories, setPreviewMemories] = useState(null);
  
  // Navigation tabs: 'incident' | 'history' | 'memories'
  const [currentTab, setCurrentTab] = useState('incident');
  const [hindsightEnabled, setHindsightEnabled] = useState(true);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Modals & Panels
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [incidentToResolve, setIncidentToResolve] = useState(null);
  const [showMemoriesViewer, setShowMemoriesViewer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [graphRefreshKey, setGraphRefreshKey] = useState(0);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const refreshHealth = async () => {
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err) {
      console.error("Health check error:", err);
    }
  };

  const loadIncidents = async () => {
    try {
      const data = await getIncidents();
      setIncidents(data);
      if (!activeIncident && data.length > 0) {
        setActiveIncident(data[data.length - 1]);
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
    }
  };

  useEffect(() => {
    refreshHealth();
    loadIncidents();
    const interval = setInterval(refreshHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // Active workflow investigation step (1 through 6)
  const [investigationStep, setInvestigationStep] = useState(1);

  const handleNewIncident = () => {
    setActiveIncident(null);
    setPreviewMemories(null);
    setInvestigationStep(1);
    setCurrentTab('incident');
  };

  const handleAnalyze = async (formData) => {
    setIsSubmitting(true);
    setPreviewMemories(null);
    try {
      const mode = formData.hindsight_enabled !== undefined ? formData.hindsight_enabled : hindsightEnabled;
      const result = await analyzeIncident({
        ...formData,
        hindsight_enabled: mode,
        memory_mode: mode ? "on" : "off"
      });
      setActiveIncident(result);
      setInvestigationStep(1);
      await loadIncidents();
      await refreshHealth();
      showToast(mode 
        ? `Incident analyzed with Hindsight ON. Recalled ${result.recalled_memories?.length || 0} historical incident(s).` 
        : `Incident analyzed with Hindsight OFF (blank slate reasoning).`);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.message || "Failed to analyze incident";
      showToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewRecall = async (recallData) => {
    setIsPreviewing(true);
    try {
      const results = await previewRecall(recallData);
      setPreviewMemories(results);
      showToast(`Hindsight Cloud returned ${results.length} relevant historical incident(s).`);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.message || "Hindsight Cloud RECALL failed";
      showToast(errMsg, "error");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleCompare = async (incidentInput) => {
    setIsComparing(true);
    setShowCompareModal(true);
    setCompareData(null);
    try {
      const payload = incidentInput || (activeIncident ? {
        title: activeIncident.title,
        service: activeIncident.service,
        severity: activeIncident.severity,
        environment: activeIncident.environment,
        symptoms: activeIncident.symptoms,
        telemetry: activeIncident.telemetry,
        logs: activeIncident.logs,
        metrics: activeIncident.metrics,
        tags: activeIncident.tags,
        error_rate: activeIncident.error_rate,
        latency_p99: activeIncident.latency_p99,
        impact: activeIncident.impact,
        affected_users: activeIncident.affected_users,
        recent_deployment: activeIncident.recent_deployment_or_change,
        hindsight_enabled: true
      } : null);

      if (!payload) {
        showToast("No incident data available to compare", "error");
        setShowCompareModal(false);
        return;
      }

      const data = await compareIncident(payload);
      setCompareData(data);
      showToast("Side-by-side memory impact analysis complete!");
    } catch (err) {
      console.error("Comparison failed:", err);
      const errMsg = err.response?.data?.detail || err.message || "Failed to run memory comparison";
      showToast(errMsg, "error");
    } finally {
      setIsComparing(false);
    }
  };

  const handleOpenResolve = (incident) => {
    setIncidentToResolve(incident);
    setShowResolveModal(true);
  };

  const handleResolve = async (incidentId, resolutionData) => {
    setIsResolving(true);
    try {
      const updated = await resolveIncident(incidentId, resolutionData);
      setActiveIncident(updated);
      setInvestigationStep(6);
      await loadIncidents();
      await refreshHealth();
      setShowResolveModal(false);
      showToast("Incident retained in organizational memory.");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.message || "Resolution and retention failed";
      showToast(errMsg, "error");
    } finally {
      setIsResolving(false);
    }
  };

  const handleLoadHistory = async () => {
    setIsLoadingHistory(true);
    // Immediately switch to the Knowledge Graph tab so the user sees it load and render
    setCurrentTab('memories');
    try {
      await seedHistoricalMemories();
      await refreshHealth();
      setGraphRefreshKey(prev => prev + 1);
      showToast("Historical incidents loaded! Displaying Knowledge Graph.");
    } catch (err) {
      console.error(err);
      setGraphRefreshKey(prev => prev + 1);
      showToast("Displaying Knowledge Graph with baseline historical incidents.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Determine active workflow step for indicator
  let effectiveStep = 1;
  if (activeIncident) {
    effectiveStep = investigationStep;
  } else if (isSubmitting) {
    effectiveStep = 3;
  } else if (isPreviewing || previewMemories) {
    effectiveStep = 2;
  }

  // Choose memories to display in right column: active incident's or preview's
  const historicalMemoriesToDisplay = activeIncident?.recalled_memories?.length
    ? activeIncident.recalled_memories
    : previewMemories || [];

  // Top bar context title
  let pageTitle = "Report New Production Incident";
  if (currentTab === 'memories') {
    pageTitle = "Memory Bank";
  } else if (currentTab === 'history') {
    pageTitle = "Historical Incidents";
  } else if (activeIncident) {
    pageTitle = `Active Incident: ${activeIncident.id}`;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-xs font-medium border bg-white animate-fade-in ${
          toastMessage.type === 'error' 
            ? 'border-rose-200 text-rose-800' 
            : 'border-emerald-200 text-slate-800'
        }`}>
          {toastMessage.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* 1. Permanent Left Sidebar (240–260px wide) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        health={health}
        onNewIncident={handleNewIncident}
        onLoadHistory={handleLoadHistory}
        isLoadingHistory={isLoadingHistory}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <TopHeader
          title={pageTitle}
          onToggleActivityDrawer={() => setShowActivityDrawer(prev => !prev)}
          isActivityDrawerOpen={showActivityDrawer}
          badgeCount={incidents.length}
          hindsightEnabled={hindsightEnabled}
          onToggleHindsight={setHindsightEnabled}
        />

        {/* Dynamic Workspace based on currentTab */}
        <main className="flex-1 p-6 space-y-4 max-w-[1600px] w-full mx-auto">
          {/* TAB 1: KNOWLEDGE GRAPH MEMORY BANK */}
          {currentTab === 'memories' && (
            <MemoryKnowledgeGraph
              health={health}
              refreshKey={graphRefreshKey}
              onOpenRawModal={() => setShowMemoriesViewer(true)}
            />
          )}

          {/* TAB 2: HISTORICAL INCIDENTS CATALOG */}
          {currentTab === 'history' && (
            <HistoricalIncidentsView
              incidents={incidents}
              onSelectIncident={(inc) => {
                setActiveIncident(inc);
                setInvestigationStep(inc.status === 'resolved' ? 6 : 1);
                setPreviewMemories(null);
                setCurrentTab('incident');
              }}
              onViewKnowledgeGraph={() => setCurrentTab('memories')}
              onNewIncident={handleNewIncident}
            />
          )}

          {/* TAB 3: ACTIVE INCIDENT WORKSPACE */}
          {currentTab === 'incident' && (
            <div className="max-w-5xl mx-auto w-full space-y-5">
              {/* Compact Workflow Step Indicator */}
              <WorkflowSteps 
                currentStep={effectiveStep} 
                onSelectStep={(step) => setInvestigationStep(step)} 
              />

              {/* Main Incident Content */}
              {!activeIncident ? (
                <IncidentForm
                  onSubmit={handleAnalyze}
                  onPreviewRecall={handlePreviewRecall}
                  onCompare={handleCompare}
                  isSubmitting={isSubmitting}
                  isPreviewing={isPreviewing}
                  isComparing={isComparing}
                  hindsightEnabled={hindsightEnabled}
                  onToggleHindsight={setHindsightEnabled}
                />
              ) : (
                <div className="space-y-5 animate-fade-in">
                  {/* Active Incident Header Card */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-bold text-sky-700">
                          {activeIncident.id}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-mono text-slate-700 font-semibold">
                          {activeIncident.service}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {activeIncident.severity}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 leading-snug">
                        {activeIncident.title}
                      </h2>
                    </div>

                    <button
                      onClick={handleNewIncident}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                    >
                      Report Another
                    </button>
                  </div>

                  {/* Investigation Results & Plan */}
                  <InvestigationReport
                    incident={activeIncident}
                    currentStep={effectiveStep}
                    onSelectStep={(step) => setInvestigationStep(step)}
                    onOpenResolve={handleOpenResolve}
                    onResolve={handleResolve}
                    onCompare={handleCompare}
                    isResolving={isResolving}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Resolution Modal */}
      {showResolveModal && (
        <ResolutionModal
          incident={incidentToResolve}
          onClose={() => setShowResolveModal(false)}
          onResolve={handleResolve}
          isResolving={isResolving}
        />
      )}

      {/* Raw Memories Inspection Modal */}
      <MemoryBankViewer
        isOpen={showMemoriesViewer}
        onClose={() => setShowMemoriesViewer(false)}
        bankId={health?.hindsight_cloud?.bank_id || "unicase-incident-memory"}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        health={health}
      />

      {/* Memory Impact Comparison Modal (Hindsight ON vs OFF) */}
      <MemoryCompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        compareData={compareData}
        isLoading={isComparing}
        incidentTitle={activeIncident?.title}
      />

      {/* Slide-out Activity & Historical Drawer (hidden by default) */}
      <ActivityHistoryDrawer
        isOpen={showActivityDrawer}
        onClose={() => setShowActivityDrawer(false)}
        currentIncident={activeIncident}
        sessionIncidents={incidents}
        onSelectIncident={(inc) => {
          setActiveIncident(inc);
          setInvestigationStep(inc.status === 'resolved' ? 6 : 1);
          setPreviewMemories(null);
          setCurrentTab('incident');
        }}
        onNewIncident={handleNewIncident}
        memories={historicalMemoriesToDisplay}
        bankId={health?.hindsight_cloud?.bank_id || "unicase-incident-memory"}
      />
    </div>
  );
}
