import React from 'react';
import { AdminPortal } from './components/AdminPortal';

export function App() {
  const handleOpenUserSite = () => {
    // Open user registration website in a new tab or fall back to main origin
    const userSiteUrl = import.meta.env.VITE_USER_SITE_URL || '/';
    window.open(userSiteUrl, '_blank');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <AdminPortal onBackToHome={handleOpenUserSite} />
    </main>
  );
}

export default App;
