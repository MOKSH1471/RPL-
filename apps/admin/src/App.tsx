import React, { useState, useEffect } from 'react';
import { AdminPortal } from './components/AdminPortal';
import { AdminLogin } from './components/auth/AdminLogin';
import { ForcePasswordChangeModal } from './components/auth/ForcePasswordChangeModal';
import { AdminUser, fetchCurrentUser, logoutAdmin } from './lib/api';
import { Trophy } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.warn('Auth verification failed:', err);
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifySession();
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
  };

  // Security Hardening: Automatic session logout after 30 minutes of idle inactivity
  useEffect(() => {
    if (!currentUser) return;

    const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.warn('Admin session timed out after 30 minutes of inactivity.');
        handleLogout();
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });

    // Start timer on initial mount / login
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetTimer);
      });
    };
  }, [currentUser]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20 mb-4 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <div className="text-xs font-bold tracking-widest uppercase text-slate-400 animate-pulse">
          Checking Security Access...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AdminLogin
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    );
  }

  // Force default credentials change before granting access to administrative features
  if (currentUser.must_change_password) {
    return (
      <ForcePasswordChangeModal
        user={currentUser}
        onSuccess={(updatedUser) => setCurrentUser(updatedUser)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <AdminPortal
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </main>
  );
}

export default App;
