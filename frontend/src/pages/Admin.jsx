import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Video, ArrowLeft, Shield, Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import { NavLink } from 'react-router';
import PageShell from '../components/ui/PageShell';
import axiosClient from '../utils/axiosClient';

function Admin() {
  const [problemCount, setProblemCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblemCount(data?.length || 0);
      } catch (e) {
        // quiet fallback
      }
    };
    fetchCount();
  }, []);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create New Problem',
      description: 'Add problem statements, test cases, and starter code templates.',
      icon: Plus,
      color: 'btn-primary',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      route: '/admin/create'
    },
    {
      id: 'video',
      title: 'Video Solutions Hub',
      description: 'Upload video walkthroughs and manage Cloudinary media assets.',
      icon: Video,
      color: 'btn-secondary',
      badgeColor: 'bg-secondary/10 text-secondary border-secondary/20',
      route: '/admin/video'
    },
    {
      id: 'delete',
      title: 'Manage & Delete Problems',
      description: 'Review full question catalog and safely remove obsolete entries.',
      icon: Trash2,
      color: 'btn-error',
      badgeColor: 'bg-error/10 text-error border-error/20',
      route: '/admin/delete'
    }
  ];

  return (
    <PageShell>
      {/* Admin Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Shield size={14} />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Platform Administration
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            Admin Workspace
          </h1>
          <p className="mt-1 text-sm text-base-content/65 leading-relaxed">
            Manage coding challenges, configure test suites, and upload video editorials.
          </p>
        </div>

        <NavLink
          to="/"
          className="btn btn-ghost btn-sm border border-base-300 gap-2 text-base-content/75 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          Back to Problems
        </NavLink>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-base-300/80 bg-base-100/60 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-base-content/50 font-medium">
              Live Problems
            </span>
            <p className="text-sm font-bold text-base-content">
              {problemCount} Challenge{problemCount === 1 ? '' : 's'} Active
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-base-300 hidden sm:block mx-2" />

        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>Automated Judge & Cloudinary Video pipeline connected</span>
        </div>
      </div>

      {/* Admin Management Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {adminOptions.map((option, index) => {
          const IconComponent = option.icon;
          return (
            <div
              key={option.id}
              className={`surface-card group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 animate-fade-up stagger-${
                (index % 3) + 1
              }`}
            >
              <div>
                <div
                  className={`inline-flex h-13 w-13 items-center justify-center rounded-2xl border p-3 ${option.badgeColor} transition-transform group-hover:scale-105`}
                >
                  <IconComponent size={24} />
                </div>

                <h2 className="mt-4 text-xl font-bold text-base-content group-hover:text-primary transition-colors">
                  {option.title}
                </h2>
                <p className="mt-2 text-xs text-base-content/70 leading-relaxed">
                  {option.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-base-300/60">
                <NavLink
                  to={option.route}
                  className={`btn ${option.color} btn-sm w-full gap-2 shadow-sm font-semibold`}
                >
                  <IconComponent size={14} />
                  <span>Open {option.title.split(' ')[0]}</span>
                </NavLink>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

export default Admin;
