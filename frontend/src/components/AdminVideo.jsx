import React, { useEffect, useState, useMemo } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink } from 'react-router';
import { ArrowLeft, Video, UploadCloud, Trash2, Search, CheckCircle2 } from 'lucide-react';
import PageShell from './ui/PageShell';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import EmptyState from './ui/EmptyState';
import DifficultyBadge from './ui/DifficultyBadge';
import ConfirmModal from './ui/ConfirmModal';

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch problem video inventory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleConfirmDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      setDeleting(true);
      await axiosClient.delete(`/video/delete/${videoToDelete._id}`);
      // Refresh or update problem list
      setProblems((prev) =>
        prev.map((p) =>
          p._id === videoToDelete._id ? { ...p, secureUrl: null, duration: null } : p
        )
      );
      setVideoToDelete(null);
    } catch (err) {
      alert(`Failed to delete video: ${err.response?.data?.message || err.message}`);
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
            Editorial Video Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-base-content/60">
            Upload video solutions or manage existing media attached to problems.
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
              placeholder="Search problems..."
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
        <LoadingState label="Loading video records..." />
      ) : problems.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No problems found"
          description="Create a problem first before uploading video tutorials."
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-base-300/80 bg-base-100 shadow-sm">
          <table className="table w-full text-xs">
            <thead>
              <tr className="border-b border-base-300 bg-base-200/50 text-base-content/60">
                <th className="py-3">#</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Video Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300/50">
              {filteredProblems.map((problem, index) => {
                const hasVideo = !!problem.secureUrl;
                return (
                  <tr key={problem._id} className="hover:bg-base-200/30 transition-colors">
                    <td className="font-mono text-base-content/50">{index + 1}</td>
                    <td className="font-semibold text-base-content max-w-xs truncate">
                      {problem.title}
                    </td>
                    <td>
                      <DifficultyBadge difficulty={problem.difficulty} size="xs" />
                    </td>
                    <td>
                      {hasVideo ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} />
                          Uploaded
                        </span>
                      ) : (
                        <span className="rounded-full bg-base-300/60 px-2.5 py-0.5 text-[11px] text-base-content/50">
                          No Video
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <NavLink
                          to={`/admin/upload/${problem._id}`}
                          className="btn btn-primary btn-xs gap-1.5 shadow-sm"
                        >
                          <UploadCloud size={13} />
                          {hasVideo ? 'Replace Video' : 'Upload Video'}
                        </NavLink>

                        {hasVideo && (
                          <button
                            type="button"
                            onClick={() => setVideoToDelete(problem)}
                            className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!videoToDelete}
        title="Delete Editorial Video?"
        message={`Are you sure you want to remove the video solution attached to "${videoToDelete?.title}"?`}
        confirmText="Yes, Delete Video"
        cancelText="Cancel"
        confirmVariant="btn-error"
        loading={deleting}
        onConfirm={handleConfirmDeleteVideo}
        onCancel={() => setVideoToDelete(null)}
      />
    </PageShell>
  );
};

export default AdminVideo;
