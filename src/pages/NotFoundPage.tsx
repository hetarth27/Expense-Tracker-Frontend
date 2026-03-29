import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="text-center animate-slide-up">
      <p className="font-mono text-brand-400 text-sm tracking-widest mb-3">404</p>
      <h1 className="font-display text-4xl font-bold text-white mb-3">Page not found</h1>
      <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary inline-flex">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
