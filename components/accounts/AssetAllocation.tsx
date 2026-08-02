import type {
  Account,
  AccountType,
} from "@/lib/account-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type AssetAllocationProps = {
  accounts: readonly Account[];
};

type AllocationRow = {
  type: AccountType;
  label: string;
  totalMinor: number;
  percentage: number;
};

const accountTypeLabels: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  investment: "Investments",
  cash: "Cash",
};

const accountTypeOrder: AccountType[] = [
  "savings",
  "investment",
  "checking",
  "cash",
];

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

function addMinorUnits(
  first: number,
  second: number
) {
  const result = first + second;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Asset allocation total exceeds the safe minor-unit range"
    );
  }

  return result;
}

export default function AssetAllocation({
  accounts,
}: AssetAllocationProps) {
  const includedAccounts = accounts.filter(
    (account) => account.includedInNetWorth
  );

  const totalMinor = includedAccounts.reduce(
    (total, account) =>
      addMinorUnits(total, account.balanceMinor),
    0
  );

  const rows: AllocationRow[] = accountTypeOrder
    .map((type) => {
      const typeTotalMinor = includedAccounts
        .filter((account) => account.type === type)
        .reduce(
          (total, account) =>
            addMinorUnits(total, account.balanceMinor),
          0
        );

      return {
        type,
        label: accountTypeLabels[type],
        totalMinor: typeTotalMinor,
        percentage:
          totalMinor === 0
            ? 0
            : (typeTotalMinor / totalMinor) * 100,
      };
    })
    .filter((row) => row.totalMinor > 0);

  return (
    <section
      aria-labelledby="asset-allocation-title"
      className="rounded-3xl border border-white/10 bg-zinc-900 p-6"
    >
      <div>
        <h2
          id="asset-allocation-title"
          className="text-lg font-semibold text-white"
        >
          Asset allocation
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Distribution of accounts included in your net worth.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
          <p className="text-sm font-semibold text-white">
            No allocation yet
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Add an included account with a balance to see how your
            net worth is distributed.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {rows.map((row) => {
            const roundedPercentage =
              Math.round(row.percentage * 10) / 10;

            return (
              <div key={row.type}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {row.label}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {formatMinorCurrency(row.totalMinor)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-zinc-300">
                    {roundedPercentage}%
                  </p>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
                    style={{
                      width: `${Math.min(
                        row.percentage,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
