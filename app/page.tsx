import DashboardPanel from "@/components/DashboardPanel";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-10">
        <header>
          <p className="text-sm font-medium text-blue-500">
            Tuesday, 29 July
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            Welcome back, Duco 👋
          </h2>

          <p className="mt-2 text-zinc-400">
            Here is your financial overview.
          </p>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Net worth"
            value="£41,283"
            description="Your total financial position"
          />

          <StatCard
            title="Monthly income"
            value="£3,150"
            description="Income received this month"
          />

          <StatCard
            title="Monthly expenses"
            value="£1,982"
            description="Expenses recorded this month"
          />

          <StatCard
            title="Monthly savings"
            value="£1,168"
            description="Income minus expenses"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <DashboardPanel
              title="Monthly cash flow"
              description="Income and expenses during the current month"
            >
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950">
                <p className="text-sm text-zinc-500">
                  Cash-flow chart coming soon
                </p>
              </div>
            </DashboardPanel>
          </div>

          <DashboardPanel
            title="Savings goal"
            description="Your progress towards a house deposit"
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">£11,000</p>
                <p className="mt-1 text-sm text-zinc-500">
                  of £30,000 saved
                </p>
              </div>

              <p className="text-sm font-semibold text-blue-500">37%</p>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[37%] rounded-full bg-blue-600" />
            </div>

            <p className="mt-4 text-sm text-zinc-400">
              £19,000 remaining
            </p>
          </DashboardPanel>
        </section>
      </section>
    </main>
  );
}