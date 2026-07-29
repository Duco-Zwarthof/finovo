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
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-400">{title}</p>

      <p className="mt-3 text-3xl font-bold text-white">{value}</p>

      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </article>
  );
}
