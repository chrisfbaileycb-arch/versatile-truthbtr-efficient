import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, MailCheck, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TruthbusterMark } from './Brand';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setMessage('');
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus('error');
      setMessage('Enter a valid email address to receive your sign-in link.');
      return;
    }
    setStatus('sending');
    setMessage('');
    const { error } = await signInWithMagicLink(value);
    if (error) {
      setStatus('error');
      setMessage(error);
      return;
    }
    setStatus('sent');
    setMessage(`We sent a one-time sign-in link to ${value}. It expires in 60 minutes.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <span
            className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-slate-900 text-white"
            aria-hidden="true"
          >
            <TruthbusterMark size={26} />
          </span>
          <DialogTitle className="text-left text-xl">Sign in to Truthbuster</DialogTitle>
          <DialogDescription className="text-left">
            No passwords. We email you a one-time link that signs you in on this device.
          </DialogDescription>
        </DialogHeader>

        {status === 'sent' ? (
          <div className="space-y-4">
            <p
              role="status"
              aria-live="polite"
              className="flex items-start gap-3 rounded-xl border border-teal-300 bg-teal-50 p-4 text-sm leading-relaxed text-teal-900"
            >
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              {message}
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="mb-1 block text-sm font-medium text-slate-900">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={status === 'error' || undefined}
                aria-describedby="auth-status"
                placeholder="you@company.com"
                className="min-h-[48px] w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Sending your link…
                </>
              ) : (
                'Email me a sign-in link'
              )}
            </button>

            <p
              id="auth-status"
              role="status"
              aria-live="polite"
              className="flex items-start gap-2 text-sm text-rose-700"
            >
              {status === 'error' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
              {status === 'error' ? message : ''}
            </p>

            <p className="flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Your audits are protected by row-level security — no other account can read your
              documents or findings.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
