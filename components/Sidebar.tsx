export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6">

      <h1 className="text-3xl font-bold text-blue-500">
        Finovo
      </h1>

      <nav className="mt-12 space-y-4">

        <button className="block text-zinc-300 hover:text-white transition">
          Dashboard
        </button>

        <button className="block text-zinc-300 hover:text-white transition">
          Budget
        </button>

        <button className="block text-zinc-300 hover:text-white transition">
          Investments
        </button>

        <button className="block text-zinc-300 hover:text-white transition">
          Goals
        </button>

        <button className="block text-zinc-300 hover:text-white transition">
          Settings
        </button>

      </nav>

    </aside>
  );
}
