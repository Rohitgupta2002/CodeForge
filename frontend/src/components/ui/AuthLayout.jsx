import React from 'react';
import { Code2, CheckCircle2, Terminal, Sparkles, Shield, Cpu } from 'lucide-react';
import { NavLink } from 'react-router';

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-base-200">
      {/* Left Column: Visual Showcase */}
      <aside className="relative hidden overflow-hidden border-r border-base-300 bg-base-100 p-10 lg:flex lg:flex-col lg:justify-between">
        {/* Ambient Gradient Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/15 blur-3xl" />

        {/* Brand Header */}
        <NavLink to="/" className="relative z-10 flex items-center gap-3 text-xl font-bold text-base-content group">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/40 shadow-sm transition-transform group-hover:scale-105">
            <Code2 size={22} />
          </span>
          <div>
            <span>Code</span>
            <span className="text-primary">Forge</span>
          </div>
        </NavLink>

        {/* Center Mockup Code Terminal */}
        <div className="relative z-10 my-8 space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              <Sparkles size={13} />
              Interactive Practice Environment
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-base-content leading-tight">
              Master Data Structures & Algorithms.
            </h1>
            <p className="text-sm text-base-content/70 leading-relaxed max-w-md">
              Run code against automated test cases, review expert video editorials, and receive AI-guided hints.
            </p>
          </div>

          {/* Mini Code Window Mockup */}
          <div className="surface-card rounded-2xl border border-base-300/80 p-4 shadow-2xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-base-300/60 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] text-base-content/40">solution.js</span>
            </div>

            <div className="space-y-1 text-base-content/80 text-[11px] leading-relaxed">
              <p><span className="text-purple-400">function</span> <span className="text-blue-400">twoSum</span>(nums, target) &#123;</p>
              <p className="pl-4 text-base-content/60"><span className="text-purple-400">const</span> map = <span className="text-purple-400">new</span> <span className="text-yellow-400">Map</span>();</p>
              <p className="pl-4 text-emerald-400">// O(N) optimized single pass solution</p>
              <p className="pl-4 text-base-content/60"><span className="text-purple-400">return</span> result;</p>
              <p>&#125;</p>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-base-300/50 p-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 size={12} /> Tests Passed (3/3)
              </span>
              <span className="text-base-content/50">Runtime: 42ms</span>
            </div>
          </div>

          {/* Feature Bullets */}
          <div className="grid grid-cols-2 gap-3 text-xs text-base-content/75 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" />
              <span>Instant Judge Runner</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" />
              <span>Full Video Editorials</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" />
              <span>Smart AI Debugger</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" />
              <span>Submission History</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-base-content/50">
          Built for serious engineers and interview candidates.
        </p>
      </aside>

      {/* Right Column: Form Card */}
      <section className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="surface-card rounded-3xl border border-base-300 p-6 sm:p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1.5 text-xs sm:text-sm text-base-content/65 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AuthLayout;
