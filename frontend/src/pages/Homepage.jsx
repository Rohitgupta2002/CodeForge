import React, { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import {
  CheckCircle2,
  ListFilter,
  Search,
  Trophy,
  Code2,
  ChevronRight,
  Flame,
  X,
  Sparkles,
  Layers,
  Circle
} from 'lucide-react';
import PageShell from '../components/ui/PageShell';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import DifficultyBadge, { getDifficultyColorConfig } from '../components/ui/DifficultyBadge';
import StatCard from '../components/ui/StatCard';

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' // 'all', 'solved', 'unsolved'
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data || []);

      if (user) {
        const solved = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(solved.data || []);
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Could not load problems. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Solved problem IDs set for quick O(1) lookup
  const solvedProblemIdSet = useMemo(() => {
    return new Set(solvedProblems.map((sp) => sp._id));
  }, [solvedProblems]);

  // Breakdown calculations
  const totalCount = problems.length;
  const solvedCount = solvedProblems.length;
  const remainingCount = Math.max(totalCount - solvedCount, 0);
  const progressPercent = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  const difficultyStats = useMemo(() => {
    const stats = {
      easy: { total: 0, solved: 0 },
      medium: { total: 0, solved: 0 },
      hard: { total: 0, solved: 0 }
    };

    problems.forEach((p) => {
      const diff = (p.difficulty || '').toLowerCase();
      if (stats[diff]) {
        stats[diff].total += 1;
        if (solvedProblemIdSet.has(p._id)) {
          stats[diff].solved += 1;
        }
      }
    });

    return stats;
  }, [problems, solvedProblemIdSet]);

  // Extract unique tags from problems or default tags
  const availableTags = useMemo(() => {
    const tags = new Set(['array', 'linkedList', 'graph', 'dp']);
    problems.forEach((p) => {
      if (p.tags) tags.add(p.tags);
    });
    return Array.from(tags);
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const isSolved = solvedProblemIdSet.has(problem._id);
      const difficultyMatch =
        filters.difficulty === 'all' ||
        (problem.difficulty || '').toLowerCase() === filters.difficulty.toLowerCase();
      const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
      
      let statusMatch = true;
      if (filters.status === 'solved') {
        statusMatch = isSolved;
      } else if (filters.status === 'unsolved') {
        statusMatch = !isSolved;
      }

      const searchMatch = (problem.title || '')
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      return difficultyMatch && tagMatch && statusMatch && searchMatch;
    });
  }, [problems, solvedProblemIdSet, filters, search]);

  const handleClearFilters = () => {
    setSearch('');
    setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    filters.difficulty !== 'all' ||
    filters.tag !== 'all' ||
    filters.status !== 'all';

  return (
    <PageShell>
      {/* Hero Welcome Banner */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                CodeForge Practice Studio
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl text-base-content">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
            </h1>
            <p className="mt-1 text-sm text-base-content/65 max-w-xl leading-relaxed">
              Sharpen your problem-solving skills, test your code against instant judge test cases, and level up your software engineering mastery.
            </p>
          </div>

          {/* Quick Motivational Badge */}
          <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-base-300/80 bg-base-100/60 p-4 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-medium">Daily Streak & Focus</p>
              <p className="text-sm font-bold text-base-content">Ready for your next challenge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics & Progress Section */}
      <section className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Library"
          value={totalCount}
          subtext="Curated questions"
          icon={Layers}
          color="primary"
        />
        <StatCard
          title="Solved Questions"
          value={solvedCount}
          subtext={`of ${totalCount} completed`}
          icon={CheckCircle2}
          color="success"
          progress={progressPercent}
        />
        <StatCard
          title="Unsolved Challenges"
          value={remainingCount}
          subtext="In queue"
          icon={Code2}
          color="warning"
        />
        
        {/* Difficulty Breakdown Card */}
        <div className="surface-card rounded-2xl p-5 border-base-300/80 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-base-content/60">
              Difficulty Mastery
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">Easy</span>
                <span className="font-mono text-base-content/80">
                  {difficultyStats.easy.solved}/{difficultyStats.easy.total}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-medium">Medium</span>
                <span className="font-mono text-base-content/80">
                  {difficultyStats.medium.solved}/{difficultyStats.medium.total}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-400 font-medium">Hard</span>
                <span className="font-mono text-base-content/80">
                  {difficultyStats.hard.solved}/{difficultyStats.hard.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="mb-6 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search problems by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full pl-10 pr-9 bg-base-100/90 text-sm focus:border-primary transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Difficulty Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'easy', 'medium', 'hard'].map((diff) => {
              const isActive = filters.difficulty === diff;
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setFilters({ ...filters, difficulty: diff })}
                  className={`btn btn-sm capitalize transition-all ${
                    isActive
                      ? diff === 'easy'
                        ? 'btn-success text-white'
                        : diff === 'medium'
                        ? 'btn-warning text-white'
                        : diff === 'hard'
                        ? 'btn-error text-white'
                        : 'btn-primary'
                      : 'btn-ghost border border-base-300 text-base-content/70 hover:text-base-content'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>

          {/* Dropdown Filters (Status & Tag) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              className="select select-bordered select-sm text-xs bg-base-100"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="solved">Solved Only</option>
              <option value="unsolved">Unsolved Only</option>
            </select>

            {/* Tag Filter */}
            <select
              className="select select-bordered select-sm text-xs bg-base-100 capitalize"
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            >
              <option value="all">All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-ghost btn-sm text-xs text-base-content/60 hover:text-error"
                title="Reset filters"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {loading && <LoadingState label="Fetching problem library..." />}

      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && filteredProblems.length === 0 && (
        <EmptyState
          icon={ListFilter}
          title="No problems found"
          description={
            hasActiveFilters
              ? 'No challenges matched your search queries or selected filters.'
              : 'There are currently no problems in the database.'
          }
          actionLabel={hasActiveFilters ? 'Clear all filters' : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      )}

      {/* Problem Cards Grid */}
      {!loading && !error && filteredProblems.length > 0 && (
        <div className="space-y-3">
          {filteredProblems.map((problem, index) => {
            const isSolved = solvedProblemIdSet.has(problem._id);
            const diffConfig = getDifficultyColorConfig(problem.difficulty);

            return (
              <NavLink
                key={problem._id}
                to={`/problem/${problem._id}`}
                className="group surface-card relative block rounded-2xl p-4 sm:p-5 transition-all hover:scale-[1.005]"
              >
                {/* Left accent border according to difficulty */}
                <div
                  className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all ${
                    problem.difficulty?.toLowerCase() === 'easy'
                      ? 'bg-emerald-500/80 group-hover:w-1.5'
                      : problem.difficulty?.toLowerCase() === 'medium'
                      ? 'bg-amber-500/80 group-hover:w-1.5'
                      : 'bg-rose-500/80 group-hover:w-1.5'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-2 sm:pl-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-base-content/40">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-base sm:text-lg font-semibold text-base-content transition-colors group-hover:text-primary">
                        {problem.title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <DifficultyBadge difficulty={problem.difficulty} size="xs" />
                      {problem.tags && (
                        <span className="rounded-full bg-base-300/70 px-2.5 py-0.5 text-[11px] font-medium text-base-content/70">
                          {problem.tags}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Status & Arrow */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-base-300/40">
                    {isSolved ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm">
                        <CheckCircle2 size={14} />
                        Solved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-base-300/40 px-3 py-1 text-xs font-medium text-base-content/50">
                        <Circle size={10} className="text-base-content/30" />
                        Todo
                      </span>
                    )}

                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-base-200 text-base-content/40 transition-all group-hover:bg-primary group-hover:text-primary-content">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </NavLink>
            );
          })}

          <div className="mt-6 flex items-center justify-between text-xs text-base-content/50 px-2">
            <span className="flex items-center gap-1.5">
              <Trophy size={14} className="text-primary" />
              Showing {filteredProblems.length} of {problems.length} problems
            </span>
            <span>Click any problem to enter CodeForge Studio</span>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default Homepage;
