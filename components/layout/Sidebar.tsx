import {
  ChartNoAxesCombined,
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
    active: true,
  },
  {
    label: "Budget",
    icon: WalletCards,
    active: false,
  },
  {
    label: "Investments",
    icon: TrendingUp,
    active: false,
  },
  {
    label: "Goals",
    icon: Target,
    active: false,
  },
  {
    label: "Settings",
    icon: Settings,
    active: false,
  },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-white/10 bg-zinc-950 px-5 py-6">
      <div className="flex items-center gap-3 px-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
          <ChartNoAxesCombined size={23} strokeWidth={2.3} />
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

      <nav className="mt-12 space-y-2">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Menu
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                item.active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <PiggyBank size={17} className="text-blue-500" />

            <p className="text-sm font-semibold text-white">
              Complete your profile
            </p>
          </div>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Add your financial details to improve your dashboard.
          </p>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-[40%] rounded-full bg-blue-600" />
          </div>
        </div>

        <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white">
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

          <span className="text-zinc-600">•••</span>
        </button>

        <p className="mt-4 text-center text-xs text-zinc-700">
          Finovo v0.1 alpha
        </p>
      </div>
    </aside>
  );
}