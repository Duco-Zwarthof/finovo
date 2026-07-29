import { Bell, Search, UserCircle2 } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-10 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-blue-500">
          Tuesday, 29 July
        </p>

        <h1 className="mt-2 text-5xl font-bold">
          Welcome back, Duco 👋
        </h1>

        <p className="mt-2 text-zinc-400">
          Here's your financial overview.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-xl border border-white/10 bg-zinc-900 p-3 transition hover:border-blue-500">
          <Search size={20} />
        </button>

        <button className="rounded-xl border border-white/10 bg-zinc-900 p-3 transition hover:border-blue-500">
          <Bell size={20} />
        </button>

        <button className="rounded-xl border border-white/10 bg-zinc-900 p-2 transition hover:border-blue-500">
          <UserCircle2 size={28} />
        </button>
      </div>
    </header>
  );
}