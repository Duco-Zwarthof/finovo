import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Wallet,
} from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
};

export default function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  function getIcon() {
    switch (title) {
      case "Net worth":
        return (
          <Wallet
            className="text-blue-400"
            size={22}
          />
        );

      case "Monthly income":
        return (
          <ArrowUpRight
            className="text-green-400"
            size={22}
          />
        );

      case "Monthly expenses":
        return (
          <ArrowDownRight
            className="text-red-400"
            size={22}
          />
        );

      case "Monthly surplus":
        return (
          <PiggyBank
            className="text-yellow-400"
            size={22}
          />
        );

      default:
        return (
          <Wallet
            className="text-blue-400"
            size={22}
          />
        );
    }
  }

  return (
    <article className="group rounded-3xl border border-white/10 bg-zinc-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-zinc-800 p-3">
          {getIcon()}
        </div>

        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
          Live
        </span>
      </div>

      <p className="mt-6 text-sm font-medium text-zinc-400">
        {title}
      </p>

      <h2 className="mt-2 text-4xl font-bold tracking-tight text-white">
        {value}
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
    </article>
  );
}
