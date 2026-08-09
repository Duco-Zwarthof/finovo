"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarClock,
  CalendarRange,
  ChartNoAxesCombined,
  ChevronRight,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  Settings,
  Target,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Net Worth",
    icon: ChartNoAxesCombined,
    href: "/net-worth",
  },
  {
    label: "Accounts",
    icon: Landmark,
    href: "/accounts",
  },
  {
    label: "Budget",
    icon: WalletCards,
    href: "/budget",
  },
  {
    label: "Investments",
    icon: TrendingUp,
    href: "/investments",
  },
  {
    label: "Goals",
    icon: Target,
    href: "/goals",
  },
  {
    label: "Recurring",
    icon: CalendarClock,
    href: "/recurring",
  },
  {
    label: "Forecast",
    icon: CalendarRange,
    href: "/forecast",
  },
  {
    label: "Settings",
    icon: Settings,
    href: null,
  },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-dvh w-72 shrink-0 flex-col border-r border-white/10 bg-zinc-950 px-5 py-6">
      <div className="flex items-center gap-3 px-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
          <ChartNoAxesCombined
            size={23}
            strokeWidth={2.3}
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Finovo
          </h1>

          <p className="text-xs text-zinc-500">
            Financial intelligence
          </p>
        </div>
      </div>

      <nav className="mt-12">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Menu
        </p>

        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href !== null &&
                  pathname.startsWith(item.href);

            const className = `group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`;

            const content = (
              <>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    isActive
                      ? "bg-white/10"
                      : "bg-white/[0.03] group-hover:bg-white/5"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                  />
                </div>

                <span className="flex-1">
                  {item.label}
                </span>

                <ChevronRight
                  size={16}
                  className={`transition ${
                    isActive
                      ? "opacity-100"
                      : "translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }`}
                />
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={className}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                disabled
                aria-disabled="true"
                title={`${item.label} is not available yet`}
                className={`${className} cursor-not-allowed opacity-60`}
              >
                {content}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto">
        <div className="mb-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <PiggyBank size={18} />
            </div>

            <p className="text-sm font-semibold text-white">
              Complete your profile
            </p>
          </div>

          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Add your financial details to improve your dashboard.
          </p>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Progress
              </span>

              <span className="font-semibold text-blue-400">
                40%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[40%] rounded-full bg-blue-600" />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-white/10 hover:bg-white/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white transition group-hover:bg-zinc-700">
            <UserRound size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              Duco Zwarthof
            </p>

            <p className="text-xs text-zinc-500">
              Personal account
            </p>
          </div>

          <span className="text-lg leading-none text-zinc-600 transition group-hover:text-zinc-400">
            •••
          </span>
        </button>

        <p className="mt-4 text-center text-xs text-zinc-700">
          Finovo v0.1 alpha
        </p>
      </div>
    </aside>
  );
}
