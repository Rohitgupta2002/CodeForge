import React, { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import EmptyState from './ui/EmptyState';
import SubmissionModal from './ui/SubmissionModal';
import { CheckCircle2, XCircle, AlertTriangle, Clock, History } from 'lucide-react';

const SubmissionHistory = ({ problemId, refreshTrigger }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
      setSubmissions(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch submission history. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (problemId) {
      fetchSubmissions();
    }
  }, [problemId, refreshTrigger]);

  const getStatusBadge = (status = '') => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={13} />
            Accepted
          </span>
        );
      case 'wrong':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <XCircle size={13} />
            Wrong Answer
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <AlertTriangle size={13} />
            Runtime Error
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-semibold text-info border border-info/20">
            <Clock size={13} />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-base-300 px-2.5 py-0.5 text-xs font-medium text-base-content/70">
            {status}
          </span>
        );
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingState label="Loading your submission history..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchSubmissions} />;
  }

  return (
    <div className="w-full space-y-4">
      {submissions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No submissions recorded yet"
          description="Write your solution in the editor and click Submit to run against all hidden judge test cases."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-base-300/80 bg-base-100 shadow-sm">
            <table className="table w-full text-xs">
              <thead>
                <tr className="border-b border-base-300 bg-base-200/50 text-base-content/60">
                  <th className="py-3">#</th>
                  <th>Status</th>
                  <th>Language</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Test Cases</th>
                  <th>Submitted At</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300/50">
                {submissions.map((sub, index) => (
                  <tr key={sub._id} className="hover:bg-base-200/40 transition-colors">
                    <td className="font-mono text-base-content/50">{index + 1}</td>
                    <td>{getStatusBadge(sub.status)}</td>
                    <td className="font-mono font-medium text-primary uppercase text-[11px]">
                      {sub.language}
                    </td>
                    <td className="font-mono text-base-content/80">
                      {sub.runtime ? `${sub.runtime}s` : 'N/A'}
                    </td>
                    <td className="font-mono text-base-content/80">{formatMemory(sub.memory)}</td>
                    <td className="font-mono text-base-content/80">
                      <span className="font-semibold">{sub.testCasesPassed}</span>/
                      {sub.testCasesTotal}
                    </td>
                    <td className="text-base-content/60">{formatDate(sub.createdAt)}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-primary hover:bg-primary/10"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-base-content/50">
            Total of {submissions.length} submission{submissions.length === 1 ? '' : 's'} made for this problem.
          </p>
        </>
      )}

      {/* Code Details Modal (Rendered into document.body via Portal) */}
      <SubmissionModal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        submission={selectedSubmission}
      />
    </div>
  );
};

export default SubmissionHistory;
