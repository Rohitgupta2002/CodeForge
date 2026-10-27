import React from 'react';
import Navbar from './Navbar';

function PageShell({ children, wide = false, className = '' }) {
  return (
    <div className="flex min-h-screen flex-col bg-base-200/50">
      <Navbar />
      <main className={`flex-1 ${wide ? 'w-full' : 'page-wrap'} animate-fade-up ${className}`}>
        {children}
      </main>
    </div>
  );
}

export default PageShell;
