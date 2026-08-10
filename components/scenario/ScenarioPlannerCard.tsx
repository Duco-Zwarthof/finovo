"use client";

import { useState } from "react";

const horizons = [1, 3, 5, 10] as const;

export default function ScenarioPlannerCard() {
  const [salary, setSalary] = useState(300);
  const [rent, setRent] = useState(150);
  const [invest, setInvest] = useState(250);
  const [years, setYears] =
    useState<(typeof horizons)[number]>(5);

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="text-xl font-bold text-white">
        Scenario planner
      </h2>

      <p className="mt-2 text-sm text-zinc-500">
        Experiment with monthly changes before making financial decisions.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm text-zinc-400">
            Salary increase (€ / month)
          </span>

          <input
            type="number"
            value={salary}
            onChange={(event) =>
              setSalary(
                Number(event.target.value) || 0
              )
            }
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-zinc-400">
            Higher expenses (€ / month)
          </span>

          <input
            type="number"
            value={rent}
            onChange={(event) =>
              setRent(
                Number(event.target.value) || 0
              )
            }
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-zinc-400">
            Extra investing (€ / month)
          </span>

          <input
            type="number"
            value={invest}
            onChange={(event) =>
              setInvest(
                Number(event.target.value) || 0
              )
            }
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {horizons.map((horizon) => {
          const isActive = years === horizon;

          return (
            <button
              key={horizon}
              type="button"
              onClick={() =>
                setYears(horizon)
              }
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "border border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {horizon} year
              {horizon > 1 ? "s" : ""}
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-6">
        <p className="text-sm text-zinc-400">
          Live calculations will be connected in the next step.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500">
              Salary
            </p>

            <p className="font-semibold text-white">
              +€{salary}/mo
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Expenses
            </p>

            <p className="font-semibold text-white">
              -€{rent}/mo
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Investing
            </p>

            <p className="font-semibold text-white">
              +€{invest}/mo • {years}y
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
