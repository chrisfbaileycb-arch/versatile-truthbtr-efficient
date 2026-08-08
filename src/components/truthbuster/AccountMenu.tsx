import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, ChevronDown, Gauge, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PLAN_MAP, IDS } from '@/data/truthbuster';
import { currency, scansRemaining } from '@/lib/anomaly';

const AccountMenu: React.FC<{ onNavigate: (href: string) => void }> = ({ onNavigate }) => {
  const { user, profile, signOut } = useAuth();
  if (!user) return null;

  const plan = profile?.plan ?? 'free';
  const planDef = PLAN_MAP[plan];
  const used = profile?.scans_used ?? 0;
  const remaining = scansRemaining(plan, used);
  const unlimited = !Number.isFinite(planDef.scansPerMonth);
  const initial = (profile?.email ?? user.email ?? '?').charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 pl-1.5 pr-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          aria-label={`Account menu for ${profile?.email ?? user.email ?? 'your account'}`}
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-md bg-slate-900 text-sm font-bold text-white"
            aria-hidden="true"
          >
            {initial}
          </span>
          <span className="hidden max-w-[9rem] truncate sm:inline">
            {profile?.email ?? user.email}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="space-y-0.5">
          <span className="block text-xs font-normal text-slate-500">Signed in as</span>
          <span className="block truncate">{profile?.email ?? user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="space-y-3 px-2 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Plan</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
              {planDef.name}
              <span className="font-normal text-slate-300">
                {planDef.price}
                {plan === 'free' ? '' : '/mo'}
              </span>
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                Scans this month
              </span>
              <span className="font-mono tabular-nums text-slate-900">
                {unlimited ? `${used} · unlimited` : `${used} / ${planDef.scansPerMonth}`}
              </span>
            </div>
            {!unlimited && (
              <>
                <div
                  role="meter"
                  aria-label="Monthly scans used"
                  aria-valuenow={used}
                  aria-valuemin={0}
                  aria-valuemax={planDef.scansPerMonth}
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200"
                >
                  <div
                    className="h-full rounded-full bg-teal-700"
                    style={{
                      width: `${Math.min(100, (used / planDef.scansPerMonth) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {remaining === 0
                    ? 'No scans left this month — upgrade for unlimited.'
                    : `${remaining} scan${remaining === 1 ? '' : 's'} remaining`}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Realized savings</span>
            <span className="font-mono tabular-nums text-teal-800">
              {currency(Number(profile?.realized_savings ?? 0))}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onNavigate(`#${IDS.pricing}`)} className="cursor-pointer">
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          {plan === 'free' ? 'Upgrade plan' : 'Manage plan'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut()} className="cursor-pointer text-rose-700">
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
