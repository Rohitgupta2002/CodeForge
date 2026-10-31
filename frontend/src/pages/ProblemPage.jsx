import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { NavLink, useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import Navbar from '../components/ui/Navbar';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import CodeBlock from '../components/ui/CodeBlock';
import { getStarterCodeForLanguage } from '../config/defaultStarterTemplates';
import {
  ArrowLeft,
  Play,
  Send,
  FileText,
  Video,
  Code2,
  History,
  Sparkles,
  Terminal,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Clock,
  HardDrive,
  RotateCcw,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const getInitialCode = (problem, selectedLanguage) => {
  return getStarterCodeForLanguage(problem?.startCode, langMap[selectedLanguage]);
};

const ProblemPage = () => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [loadError, setLoadError] = useState(null);
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [mobileView, setMobileView] = useState('description'); // 'description', 'code', 'result'
  const [copiedKey, setCopiedKey] = useState(null);
  const editorRef = useRef(null);

  // Fetch problem on mount or when problemId changes
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setLoadError(null);
      setRunResult(null);
      setSubmitResult(null);
      setActiveTestCaseIdx(0);

      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);
        setCode(getInitialCode(response.data, selectedLanguage));
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoadError(
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Unable to load this problem. It may have been deleted or is unavailable.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  // Update starter code when language switches
  useEffect(() => {
    if (problem) {
      setCode(getInitialCode(problem, selectedLanguage));
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleResetStarterCode = () => {
    if (problem) {
      setCode(getInitialCode(problem, selectedLanguage));
    }
  };

  const handleRightTabChange = (tabId) => {
    setActiveRightTab(tabId);
    if (tabId === 'code') {
      setTimeout(() => {
        editorRef.current?.layout();
      }, 50);
    }
  };

  const handleRun = async () => {
    if (running || submitting) return;
    setRunning(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      handleRightTabChange('testcase');
      setMobileView('result');
      setActiveTestCaseIdx(0);
    } catch (error) {
      console.error('Error running code:', error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Server error while running testcases';
      setRunResult({
        success: false,
        error: errorMsg,
        testCases: []
      });
      handleRightTabChange('testcase');
      setMobileView('result');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (running || submitting) return;
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
      setSubmissionCount((prev) => prev + 1);
      handleRightTabChange('result');
      setMobileView('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Submission failed';
      setSubmitResult({
        accepted: false,
        error: errorMsg
      });
      handleRightTabChange('result');
      setMobileView('result');
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcut listener (Ctrl/Cmd + Enter -> Submit, Ctrl/Cmd + ' -> Run)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmitCode();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "'") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, selectedLanguage, problemId, running, submitting]);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript':
        return 'javascript';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      default:
        return 'javascript';
    }
  };

  const leftTabs = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'editorial', label: 'Editorial', icon: Video },
    { id: 'solutions', label: 'Solutions', icon: Code2 },
    { id: 'submissions', label: 'Submissions', icon: History },
    { id: 'chatAI', label: 'AI Assistant', icon: Sparkles }
  ];

  const rightTabs = [
    { id: 'code', label: 'Code Editor', icon: Terminal },
    { id: 'testcase', label: 'Test Results', icon: CheckCircle2 },
    { id: 'result', label: 'Submission', icon: Send }
  ];

  if (loading && !problem) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <LoadingState label="Preparing CodeForge Studio..." />
      </div>
    );
  }

  if (loadError && !problem) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="page-wrap py-12">
          <EmptyState title="Problem Unavailable" description={loadError} />
          <div className="mt-6 text-center">
            <NavLink to="/" className="btn btn-primary btn-sm">
              Back to problems
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-base-200">
      {/* Top Studio Header */}
      <header className="z-30 shrink-0 border-b border-base-300/80 bg-base-100/90 px-3 sm:px-6 py-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back & Problem Title */}
          <div className="flex items-center gap-3 min-w-0">
            <NavLink
              to="/"
              className="btn btn-ghost btn-xs sm:btn-sm gap-1.5 text-base-content/70 hover:text-base-content shrink-0"
              title="Return to problem set"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Problems</span>
            </NavLink>

            <div className="h-4 w-px bg-base-300 shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <h1 className="truncate text-sm sm:text-base font-bold text-base-content">
                {problem?.title}
              </h1>
              <DifficultyBadge difficulty={problem?.difficulty} size="xs" />
            </div>
          </div>

          {/* Right: Language, Run, Submit */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Selector */}
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="btn btn-ghost btn-xs sm:btn-sm font-mono text-xs uppercase border border-base-300/80"
              >
                {selectedLanguage === 'cpp' ? 'C++' : selectedLanguage === 'javascript' ? 'JavaScript' : 'Java'}
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu menu-sm mt-2 w-36 rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-xl z-20"
              >
                {['javascript', 'java', 'cpp'].map((lang) => (
                  <li key={lang}>
                    <button
                      type="button"
                      className={`capitalize ${selectedLanguage === lang ? 'active font-semibold' : ''}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Run Button */}
            <button
              type="button"
              onClick={handleRun}
              disabled={running || submitting}
              className="btn btn-ghost btn-xs sm:btn-sm border border-base-300/80 hover:border-primary/40 text-base-content gap-1.5"
              title="Run visible test cases (Ctrl + ')"
            >
              {running ? (
                <span className="loading loading-spinner loading-xs text-primary" />
              ) : (
                <Play size={13} className="text-primary fill-primary" />
              )}
              <span className="hidden sm:inline">Run</span>
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmitCode}
              disabled={running || submitting}
              className="btn btn-primary btn-xs sm:btn-sm gap-1.5 shadow-sm shadow-primary/20"
              title="Submit solution to official judge (Ctrl + Enter)"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Send size={13} />
              )}
              <span>Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Segmented Switcher (Visible on < lg screens) */}
      <div className="flex lg:hidden shrink-0 border-b border-base-300 bg-base-100 px-2 py-1.5 z-20">
        <div className="grid w-full grid-cols-3 gap-1 rounded-xl bg-base-200/80 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMobileView('description')}
            className={`rounded-lg py-1.5 font-medium transition-all ${
              mobileView === 'description' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/60'
            }`}
          >
            Problem
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileView('code');
              handleRightTabChange('code');
            }}
            className={`rounded-lg py-1.5 font-medium transition-all ${
              mobileView === 'code' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/60'
            }`}
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileView('result');
              handleRightTabChange(submitResult ? 'result' : 'testcase');
            }}
            className={`rounded-lg py-1.5 font-medium transition-all ${
              mobileView === 'result' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/60'
            }`}
          >
            Results
          </button>
        </div>
      </div>

      {/* Main Studio Body: Flex Row with min-w-0 for robust Flexbox partitioning */}
      <div className="flex flex-1 min-h-0 min-w-0 flex-col lg:flex-row overflow-hidden">
        {/* Left Pane (Description, Editorial, Solutions, Submissions, AI) */}
        <div
          className={`flex flex-col border-b lg:border-b-0 lg:border-r border-base-300 bg-base-100 lg:w-1/2 h-full min-h-0 min-w-0 ${
            mobileView === 'description' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Left Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-base-300 bg-base-200/40 px-3 py-1.5 scrollbar-none shrink-0 min-w-0">
            {leftTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeLeftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLeftTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-base-100 text-primary shadow-sm'
                      : 'text-base-content/65 hover:bg-base-100/50 hover:text-base-content'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-primary' : 'text-base-content/50'} />
                  {tab.label}
                  {tab.id === 'chatAI' && (
                    <span className="badge badge-primary badge-xs scale-90">AI</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0 min-w-0">
            {problem && (
              <>
                {/* 1. Description Tab */}
                {activeLeftTab === 'description' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <DifficultyBadge difficulty={problem.difficulty} />
                        {problem.tags && (
                          <span className="rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-medium text-base-content/70">
                            {problem.tags}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-base-content">
                        {problem.title}
                      </h2>
                    </div>

                    {/* Problem Statement */}
                    <div className="rounded-2xl border border-base-300/70 bg-base-200/30 p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">
                        Statement
                      </p>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-base-content/90 font-sans break-words">
                        {problem.description}
                      </div>
                    </div>

                    {/* Visible Test Cases / Examples */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/70">
                        Examples & Constraints
                      </h3>
                      {problem.visibleTestCases?.map((example, index) => (
                        <div
                          key={index}
                          className="surface-card rounded-2xl p-4 sm:p-5 border-base-300 space-y-3 min-w-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                              Example {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(example.input, `ex-input-${index}`)}
                              className="btn btn-ghost btn-xs gap-1 text-[11px] text-base-content/50 hover:text-base-content"
                            >
                              {copiedKey === `ex-input-${index}` ? (
                                <>
                                  <Check size={12} className="text-success" />
                                  <span className="text-success">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy Input</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="space-y-2 rounded-xl bg-base-300/60 p-3 font-mono text-xs text-base-content/90 min-w-0">
                            <div className="overflow-x-auto">
                              <span className="text-base-content/50">Input: </span>
                              <span className="font-semibold">{example.input}</span>
                            </div>
                            <div className="overflow-x-auto">
                              <span className="text-base-content/50">Output: </span>
                              <span className="font-semibold text-emerald-400">{example.output}</span>
                            </div>
                            {example.explanation && (
                              <div className="font-sans text-xs text-base-content/75 pt-1 border-t border-base-300/60 mt-1 break-words">
                                <span className="font-semibold text-base-content">Explanation: </span>
                                {example.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Editorial Tab */}
                {activeLeftTab === 'editorial' && (
                  <Editorial
                    secureUrl={problem.secureUrl}
                    thumbnailUrl={problem.thumbnailUrl}
                    duration={problem.duration}
                  />
                )}

                {/* 3. Solutions Tab */}
                {activeLeftTab === 'solutions' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-base-content">Reference Solutions</h2>
                      <p className="text-xs text-base-content/60 mt-1">
                        Review official clean code implementations across multiple languages.
                      </p>
                    </div>

                    {problem.referenceSolution?.length ? (
                      <div className="space-y-4 min-w-0">
                        {problem.referenceSolution.map((sol, index) => (
                          <CodeBlock
                            key={index}
                            code={sol.completeCode}
                            language={sol.language}
                            title={`${problem.title} - ${sol.language}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Code2}
                        title="No reference solutions uploaded"
                        description="Solutions have not been published for this problem yet. Try submitting your own answer!"
                      />
                    )}
                  </div>
                )}

                {/* 4. Submissions Tab */}
                {activeLeftTab === 'submissions' && (
                  <SubmissionHistory
                    problemId={problemId}
                    refreshTrigger={submissionCount}
                  />
                )}

                {/* 5. AI Assistant Tab */}
                {activeLeftTab === 'chatAI' && (
                  <div className="h-full min-h-[460px]">
                    <ChatAi problem={problem} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Pane (Monaco Editor, Testcase Runner, Submission Result) */}
        <div
          className={`flex flex-col lg:w-1/2 h-full min-h-0 min-w-0 bg-base-100 ${
            mobileView === 'code' || mobileView === 'result' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Right Pane Tabs */}
          <div className="flex items-center justify-between border-b border-base-300 bg-base-200/40 px-3 py-1.5 shrink-0 min-w-0">
            <div className="flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-none">
              {rightTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeRightTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleRightTabChange(tab.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
                      isActive
                        ? 'bg-base-100 text-primary shadow-sm'
                        : 'text-base-content/65 hover:bg-base-100/50 hover:text-base-content'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-primary' : 'text-base-content/50'} />
                    <span>{tab.label}</span>
                    {tab.id === 'testcase' && runResult && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          runResult.success ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                    )}
                    {tab.id === 'result' && submitResult && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          submitResult.accepted ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions in Editor Header */}
            {activeRightTab === 'code' && (
              <button
                type="button"
                onClick={handleResetStarterCode}
                className="btn btn-ghost btn-xs gap-1 text-[11px] text-base-content/50 hover:text-base-content shrink-0"
                title="Reset code to starter template"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reset Code</span>
              </button>
            )}
          </div>

          {/* Right Tab 1: Monaco Editor (Kept mounted in DOM to preserve undo/redo & cursor) */}
          <div
            className={`flex flex-1 min-h-0 min-w-0 flex-col ${
              activeRightTab === 'code' ? 'flex' : 'hidden'
            }`}
          >
            <div className="flex-1 min-h-0 min-w-0 w-full overflow-hidden">
              <Editor
                height="100%"
                language={getLanguageForMonaco(selectedLanguage)}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: 'line',
                  roundedSelection: true,
                  cursorStyle: 'line',
                  smoothScrolling: true,
                  mouseWheelZoom: true,
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>

            {/* Bottom Quick Control Bar */}
            <div className="flex items-center justify-between border-t border-base-300 bg-base-100 px-4 py-2.5 text-xs shrink-0 min-w-0">
              <button
                type="button"
                className="btn btn-ghost btn-xs gap-1.5 text-base-content/65 hover:text-base-content"
                onClick={() => handleRightTabChange('testcase')}
              >
                <Terminal size={13} />
                <span>Console / Test Results</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] text-base-content/40">
                  Ctrl + ' to Run &bull; Ctrl + Enter to Submit
                </span>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={running || submitting}
                  className="btn btn-ghost btn-xs border border-base-300 gap-1.5"
                >
                  {running ? <span className="loading loading-spinner loading-xs text-primary" /> : <Play size={12} />}
                  Run
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCode}
                  disabled={running || submitting}
                  className="btn btn-primary btn-xs gap-1.5"
                >
                  {submitting ? <span className="loading loading-spinner loading-xs" /> : <Send size={12} />}
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Right Tab 2: Test Case Results Console */}
          <div
            className={`flex-1 min-h-0 min-w-0 flex-col overflow-y-auto p-4 sm:p-6 space-y-4 ${
              activeRightTab === 'testcase' ? 'flex' : 'hidden'
            }`}
          >
            <div className="flex items-center justify-between shrink-0 min-w-0 gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-2 truncate">
                <Terminal size={15} className="text-primary shrink-0" />
                Execution Output
              </h3>

              <div className="flex items-center gap-2 shrink-0">
                {runResult && (
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                      runResult.success
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {runResult.success ? 'All Tests Passed' : 'Test Failed'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRightTabChange('code')}
                  className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 gap-1"
                >
                  <Code2 size={13} />
                  <span className="hidden sm:inline">Back to Code</span>
                </button>
              </div>
            </div>

            {runResult ? (
              <div className="space-y-4 min-w-0">
                {/* Runtime & Memory Badge Bar */}
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-base-300/80 bg-base-200/50 p-3 text-xs min-w-0">
                  <div className="flex items-center gap-1.5 text-base-content/70">
                    <Clock size={14} className="text-primary" />
                    <span>Runtime:</span>
                    <span className="font-mono font-semibold text-base-content">
                      {runResult.runtime !== undefined && runResult.runtime !== null ? `${runResult.runtime}s` : '0.00s'}
                    </span>
                  </div>
                  <div className="h-3 w-px bg-base-300" />
                  <div className="flex items-center gap-1.5 text-base-content/70">
                    <HardDrive size={14} className="text-secondary" />
                    <span>Memory:</span>
                    <span className="font-mono font-semibold text-base-content">
                      {runResult.memory !== undefined && runResult.memory !== null ? `${runResult.memory} KB` : '0 KB'}
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {runResult.error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-mono min-w-0">
                    <p className="font-bold text-rose-400 mb-1 flex items-center gap-1.5 font-sans">
                      <AlertTriangle size={15} />
                      {runResult.error === 'Wrong Answer' ? 'Result Verdict:' : 'Execution Notice:'}
                    </p>
                    <p className="text-rose-300 whitespace-pre-wrap">
                      {runResult.error === 'Wrong Answer'
                        ? 'Wrong Answer: The output does not match the expected answer for one or more test cases. Review the actual vs. expected output below.'
                        : runResult.error}
                    </p>
                  </div>
                )}

                {/* Test Cases Tabbed Viewer */}
                {runResult.testCases?.length > 0 ? (
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 min-w-0 scrollbar-none">
                      {runResult.testCases.map((tc, idx) => {
                        const isPassed = tc.status_id === 3;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveTestCaseIdx(idx)}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
                              activeTestCaseIdx === idx
                                ? 'bg-base-200 text-base-content border border-primary/50 shadow-sm'
                                : 'bg-base-100 text-base-content/60 border border-base-300 hover:bg-base-200'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isPassed ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                            Case {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Case Details */}
                    {runResult.testCases[activeTestCaseIdx] && (
                      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5 space-y-4 min-w-0">
                        {/* Status for this specific testcase */}
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-base-300/60">
                          <span className="font-semibold text-base-content/70">
                            Test Case #{activeTestCaseIdx + 1}
                          </span>
                          <span
                            className={`font-semibold flex items-center gap-1 ${
                              runResult.testCases[activeTestCaseIdx].status_id === 3
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {runResult.testCases[activeTestCaseIdx].status_id === 3 ? (
                              <>
                                <CheckCircle2 size={13} /> Passed
                              </>
                            ) : (
                              <>
                                <XCircle size={13} /> {runResult.testCases[activeTestCaseIdx].status?.description || 'Failed'}
                              </>
                            )}
                          </span>
                        </div>

                        {/* Stdin (Input) */}
                        <div className="min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-sans font-semibold text-base-content/60 uppercase tracking-wider">
                              Input
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(runResult.testCases[activeTestCaseIdx].stdin, 'stdin')}
                              className="btn btn-ghost btn-xs text-[10px] gap-1 text-base-content/50 hover:text-base-content"
                            >
                              {copiedKey === 'stdin' ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                              <span>{copiedKey === 'stdin' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="rounded-xl bg-base-200/80 p-3 overflow-x-auto font-mono text-xs text-base-content whitespace-pre">
                            <code>{runResult.testCases[activeTestCaseIdx].stdin || '(empty input)'}</code>
                          </pre>
                        </div>

                        {/* Expected Output */}
                        <div className="min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-sans font-semibold text-base-content/60 uppercase tracking-wider">
                              Expected Output
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(runResult.testCases[activeTestCaseIdx].expected_output, 'expected')}
                              className="btn btn-ghost btn-xs text-[10px] gap-1 text-base-content/50 hover:text-base-content"
                            >
                              {copiedKey === 'expected' ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                              <span>{copiedKey === 'expected' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="rounded-xl bg-base-200/80 p-3 overflow-x-auto font-mono text-xs text-emerald-400 whitespace-pre">
                            <code>{runResult.testCases[activeTestCaseIdx].expected_output || '(empty output)'}</code>
                          </pre>
                        </div>

                        {/* Actual Output */}
                        <div className="min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-sans font-semibold text-base-content/60 uppercase tracking-wider">
                              Your Output
                            </span>
                            {runResult.testCases[activeTestCaseIdx].stdout && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(runResult.testCases[activeTestCaseIdx].stdout, 'stdout')}
                                className="btn btn-ghost btn-xs text-[10px] gap-1 text-base-content/50 hover:text-base-content"
                              >
                                {copiedKey === 'stdout' ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                                <span>{copiedKey === 'stdout' ? 'Copied' : 'Copy'}</span>
                              </button>
                            )}
                          </div>
                          <pre className="rounded-xl bg-base-200/80 p-3 overflow-x-auto font-mono text-xs text-base-content whitespace-pre">
                            <code>{runResult.testCases[activeTestCaseIdx].stdout || '(No output)'}</code>
                          </pre>
                        </div>

                        {/* Stderr / Compiler Output if any */}
                        {(runResult.testCases[activeTestCaseIdx].stderr ||
                          runResult.testCases[activeTestCaseIdx].compile_output) && (
                          <div className="min-w-0">
                            <span className="text-[11px] font-sans font-semibold text-error uppercase tracking-wider mb-1 block">
                              Error Output (stderr / compile)
                            </span>
                            <pre className="rounded-xl bg-error/10 border border-error/20 p-3 overflow-x-auto font-mono text-xs text-error whitespace-pre-wrap">
                              <code>
                                {runResult.testCases[activeTestCaseIdx].stderr ||
                                  runResult.testCases[activeTestCaseIdx].compile_output}
                              </code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  !runResult.error && (
                    <EmptyState
                      icon={Terminal}
                      title="No test case records returned"
                      description="The runner completed without returning individual test cases."
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState
                icon={Play}
                title="No test output yet"
                description="Click the Run button to evaluate your code against the visible example test cases."
                actionLabel="Run Code Now"
                onAction={handleRun}
              />
            )}
          </div>

          {/* Right Tab 3: Official Submission Result */}
          <div
            className={`flex-1 min-h-0 min-w-0 flex-col overflow-y-auto p-4 sm:p-6 space-y-4 ${
              activeRightTab === 'result' ? 'flex' : 'hidden'
            }`}
          >
            <div className="flex items-center justify-between shrink-0 min-w-0">
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-2">
                <Send size={15} className="text-primary" />
                Official Submission Verdict
              </h3>
              <button
                type="button"
                onClick={() => handleRightTabChange('code')}
                className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 gap-1"
              >
                <Code2 size={13} />
                <span>Back to Code</span>
              </button>
            </div>

            {submitResult ? (
              <div className="space-y-4 min-w-0">
                {/* Verdict Banner */}
                <div
                  className={`surface-card rounded-2xl p-6 border ${
                    submitResult.accepted
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${
                        submitResult.accepted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {submitResult.accepted ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    </div>
                    <div>
                      <h4
                        className={`text-xl font-bold ${
                          submitResult.accepted ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {submitResult.accepted
                          ? 'Accepted'
                          : submitResult.error || submitResult.status || 'Wrong Answer'}
                      </h4>
                      <p className="text-xs text-base-content/60 mt-0.5">
                        {submitResult.accepted
                          ? 'Congratulations! All hidden judge test cases passed.'
                          : 'Your solution did not pass all hidden judge test cases.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-base-300/60 pt-4 text-xs font-mono">
                    <div>
                      <span className="text-base-content/50">Passed:</span>
                      <p className="text-sm font-bold text-base-content mt-0.5">
                        {submitResult.passedTestCases ?? 0} / {submitResult.totalTestCases ?? 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/50">Runtime:</span>
                      <p className="text-sm font-bold text-base-content mt-0.5">
                        {submitResult.runtime !== undefined && submitResult.runtime !== null
                          ? `${submitResult.runtime}s`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/50">Memory:</span>
                      <p className="text-sm font-bold text-base-content mt-0.5">
                        {submitResult.memory !== undefined && submitResult.memory !== null
                          ? `${submitResult.memory} KB`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveLeftTab('submissions')}
                    className="btn btn-ghost btn-sm text-xs gap-1.5"
                  >
                    <History size={13} />
                    View in Submissions History
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRightTabChange('code')}
                    className="btn btn-primary btn-sm text-xs gap-1.5"
                  >
                    <Code2 size={13} />
                    Edit Solution
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Send}
                title="No submission evaluation yet"
                description="Click Submit to evaluate your code against all hidden test cases in the official judge."
                actionLabel="Submit Solution Now"
                onAction={handleSubmitCode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
