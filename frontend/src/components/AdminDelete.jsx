import React, { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import { ArrowLeft, Trash2, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import PageShell from './ui/PageShell';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import EmptyState from './ui/EmptyState';
import DifficultyBadge from './ui/DifficultyBadge';
import ConfirmModal from './ui/ConfirmModal';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch problems from server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!problemToDelete) return;

    try {
      setDeleting(true);
      await axiosClient.delete(`/problem/delete/${problemToDelete._id}`);
      setProblems((prev) => prev.filter((p) => p._id !== problemToDelete._id));
      setProblemToDelete(null);
    } catch (err) {
      alert(`Failed to delete problem: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((p) =>
      (p.title || '').toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [problems, search]);

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
            Delete Problems
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-base-content/60">
            Permanently remove coding challenges from the live platform.
          </p>
        </div>
        <NavLink
          to="/admin"
          className="btn btn-ghost btn-sm border border-base-300 gap-2 text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          Admin Hub
        </NavLink>
      </div>

      {error && <ErrorState message={error} onRetry={fetchProblems} />}

      {/* Search Bar */}
      {!loading && !error && problems.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
            />
            <input
              type="text"
              placeholder="Search problems to delete..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered input-sm w-full pl-9 text-xs bg-base-100"
            />
          </div>
          <span className="text-xs text-base-content/50 font-medium">
            {filteredProblems.length} of {problems.length} problems
          </span>
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading problems..." />
      ) : problems.length === 0 ? (
        <EmptyState
          title="No problems found"
          description="Create a problem first before managing it here."
        />
      ) : filteredProblems.length === 0 ? (
        <EmptyState
          title="No matching problems"
          description="No problem matched your search filter."
          actionLabel="Clear Search"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-base-300/80 bg-base-100 shadow-sm">
          <table className="table w-full text-xs">
            <thead>
              <tr className="border-b border-base-300 bg-base-200/50 text-base-content/60">
                <th className="py-3">#</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tag</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300/50">
              {filteredProblems.map((problem, index) => (
                <tr key={problem._id} className="hover:bg-base-200/30 transition-colors">
                  <td className="font-mono text-base-content/50">{index + 1}</td>
                  <td className="font-semibold text-base-content max-w-xs truncate">
                    {problem.title}
                  </td>
                  <td>
                    <DifficultyBadge difficulty={problem.difficulty} size="xs" />
                  </td>
                  <td>
                    <span className="rounded-full bg-base-300/60 px-2 py-0.5 text-[11px] text-base-content/70">
                      {problem.tags}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => setProblemToDelete(problem)}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!problemToDelete}
        title="Delete Problem?"
        message={`Are you sure you want to permanently delete "${problemToDelete?.title}"? All associated submission data and test records will be erased.`}
        confirmText="Yes, Delete Problem"
        cancelText="Cancel"
        confirmVariant="btn-error"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProblemToDelete(null)}
      />
    </PageShell>
  );
};

export default AdminDelete;
