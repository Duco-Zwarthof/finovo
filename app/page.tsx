export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090B] text-white flex flex-col items-center justify-center px-6">

      <h1 className="text-7xl font-black tracking-tight">
        Finovo
      </h1>

      <p className="mt-6 text-xl text-zinc-400 text-center max-w-2xl">
        Build your financial future.
      </p>

      <button className="mt-12 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold transition hover:bg-blue-500">
        Enter Dashboard
      </button>

    </main>
  );
}
