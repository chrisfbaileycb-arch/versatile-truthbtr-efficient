import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WifiOff } from 'lucide-react';
import Header from '@/components/truthbuster/Header';
import Hero from '@/components/truthbuster/Hero';
import Dashboard from '@/components/truthbuster/Dashboard';
import ScanPanel from '@/components/truthbuster/ScanPanel';
import Detectors from '@/components/truthbuster/Detectors';
import Pricing from '@/components/truthbuster/Pricing';
import FaqSection from '@/components/truthbuster/FaqSection';
import TrustLegal from '@/components/truthbuster/TrustLegal';
import Footer from '@/components/truthbuster/Footer';
import AnomalyDetail from '@/components/truthbuster/AnomalyDetail';
import AuthModal from '@/components/truthbuster/AuthModal';
import { Anomaly, IDS, SAMPLE_ANOMALIES } from '@/data/truthbuster';
import { totalExposure } from '@/lib/anomaly';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';


const SECTION_IDS = [IDS.dashboard, IDS.scan, IDS.detectors, IDS.pricing, IDS.faq];

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AppLayout: React.FC = () => {
  const { user, profile } = useAuth();
  const [anomalies, setAnomalies] = useState<Anomaly[]>(SAMPLE_ANOMALIES);
  const [selected, setSelected] = useState<Anomaly | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(IDS.dashboard);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);

  // Welcome the user back once a magic-link session lands.
  useEffect(() => {
    if (user) setAuthOpen(false);
  }, [user]);

  /* ------------------------------------------------ PWA install + offline */
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline caching is a progressive enhancement — ignore failures */
      });
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') {
      toast({ title: 'Truthbuster installed', description: 'Launch it from your home screen.' });
    }
    setInstallEvent(null);
  }, [installEvent]);

  /* --------------------------------------------- scroll spy + navigation */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const navigate = useCallback((href: string) => {
    const id = href.replace('#', '');
    if (!id || id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Move keyboard focus to the target so screen readers follow the jump.
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }, []);

  /* ------------------------------------------------------ anomaly actions */
  const openAnomaly = useCallback((a: Anomaly) => {
    setSelected(a);
    setDetailOpen(true);
  }, []);

  const setStatus = useCallback(
    (id: string, status: Anomaly['status'], message: string) => {
      setAnomalies((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
      setDetailOpen(false);
      toast({ title: message });
    },
    [],
  );

  const exposure = useMemo(() => totalExposure(anomalies), [anomalies]);
  const openCount = useMemo(() => anomalies.filter((a) => a.status === 'open').length, [anomalies]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <Header
        activeSection={activeSection}
        onNavigate={navigate}
        onInstall={handleInstall}
        canInstall={Boolean(installEvent)}
        onSignIn={() => setAuthOpen(true)}
      />

      {offline && (
        <p
          role="status"
          className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900"
        >
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          You’re offline — showing your last cached audit. New scans will run when you reconnect.
        </p>
      )}

      {user && profile && (
        <p className="bg-slate-900 px-4 py-2 text-center text-sm text-slate-200">
          Signed in as{' '}
          <span className="font-semibold text-white">{profile.email ?? user.email}</span> ·{' '}
          {profile.plan.toUpperCase()} plan · {profile.scans_used} scan
          {profile.scans_used === 1 ? '' : 's'} used this month
        </p>
      )}

      <main id={IDS.main} tabIndex={-1} className="focus:outline-none">
        <Hero onNavigate={navigate} exposure={exposure} openCount={openCount} />
        <Dashboard anomalies={anomalies} onOpen={openAnomaly} />
        <ScanPanel onRequireSignIn={() => setAuthOpen(true)} />
        <Detectors anomalies={anomalies} onNavigate={navigate} />
        <Pricing onNavigate={navigate} />
        <FaqSection />
        <TrustLegal />
      </main>

      <Footer onNavigate={navigate} />

      <AnomalyDetail
        anomaly={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onResolve={(id) => setStatus(id, 'resolved', 'Marked as recovered — added to your savings.')}
        onDismiss={(id) => setStatus(id, 'dismissed', 'Flag dismissed. The detector will learn from it.')}
        onFeedback={(_id, helpful) =>
          toast({
            title: helpful ? 'Thanks — noted as useful' : 'Thanks — we’ll tune that detector',
            description: 'Feedback adjusts the confidence baseline for your account.',
          })
        }
      />

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default AppLayout;
