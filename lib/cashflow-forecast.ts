import type { Account } from "./account-types";
import type { RecurringTransaction } from "./recurring-transaction-types";
import {
  generateRecurringOccurrences,
  isValidRecurringDate,
} from "./recurring-transactions";
import type {
  CashflowForecast,
  CashflowForecastEvent,
  CashflowForecastPoint,
} from "./cashflow-forecast-types";

function addMinorUnits(
  first: number,
  second: number
): number {
  const result = first + second;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Cashflow forecast exceeds the safe minor-unit range"
    );
  }

  return result;
}

function subtractMinorUnits(
  first: number,
  second: number
): number {
  const result = first - second;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Cashflow forecast exceeds the safe minor-unit range"
    );
  }

  return result;
}

export function calculateForecastStartingBalanceMinor(
  accounts: readonly Account[]
): number {
  return accounts.reduce(
    (total, account) => {
      if (!account.includedInNetWorth) {
        return total;
      }

      if (
        account.type !== "checking" &&
        account.type !== "savings" &&
        account.type !== "cash"
      ) {
        return total;
      }

      return addMinorUnits(
        total,
        account.balanceMinor
      );
    },
    0
  );
}

export function buildForecastEvents(
  items: readonly RecurringTransaction[],
  rangeStart: string,
  rangeEnd: string,
  startingBalanceMinor: number
): {
  events: CashflowForecastEvent[];
  endingBalanceMinor: number;
} {
  if (
    !isValidRecurringDate(rangeStart) ||
    !isValidRecurringDate(rangeEnd) ||
    rangeEnd < rangeStart
  ) {
    throw new RangeError(
      "Cannot build a cashflow forecast for an invalid date range"
    );
  }

  if (!Number.isSafeInteger(startingBalanceMinor)) {
    throw new RangeError(
      "Cannot build a cashflow forecast from an invalid starting balance"
    );
  }

  const occurrences = items.flatMap(
    (item) =>
      generateRecurringOccurrences(
        item,
        rangeStart,
        rangeEnd
      ).map((occurrence) => ({
        item,
        occurrence,
      }))
  );

  occurrences.sort(
    (first, second) =>
      first.occurrence.date.localeCompare(
        second.occurrence.date
      ) ||
      first.item.id.localeCompare(
        second.item.id
      )
  );

  let balanceMinor =
    startingBalanceMinor;

  const events: CashflowForecastEvent[] =
    occurrences.map(
      ({ item, occurrence }) => {
        balanceMinor =
          item.type === "income"
            ? addMinorUnits(
                balanceMinor,
                item.amountMinor
              )
            : subtractMinorUnits(
                balanceMinor,
                item.amountMinor
              );

        return {
          id: `forecast:${item.id}:${occurrence.date}`,
          recurringTransactionId:
            item.id,
          title: item.title,
          category: item.category,
          type: item.type,
          date: occurrence.date,
          amountMinor: item.amountMinor,
          balanceAfterMinor:
            balanceMinor,
        };
      }
    );

  return {
    events,
    endingBalanceMinor:
      balanceMinor,
  };
}

export function buildForecastPoints(
  startDate: string,
  startingBalanceMinor: number,
  events: readonly CashflowForecastEvent[]
): CashflowForecastPoint[] {
  const points: CashflowForecastPoint[] = [
    {
      date: startDate,
      balanceMinor:
        startingBalanceMinor,
    },
  ];

  for (const event of events) {
    const lastPoint =
      points[points.length - 1];

    if (lastPoint.date === event.date) {
      lastPoint.balanceMinor =
        event.balanceAfterMinor;
      continue;
    }

    points.push({
      date: event.date,
      balanceMinor:
        event.balanceAfterMinor,
    });
  }

  return points;
}

export function calculateCashflowForecast(
  accounts: readonly Account[],
  recurringItems: readonly RecurringTransaction[],
  startDate: string,
  endDate: string
): CashflowForecast {
  const startingBalanceMinor =
    calculateForecastStartingBalanceMinor(
      accounts
    );

  const {
    events,
    endingBalanceMinor,
  } = buildForecastEvents(
    recurringItems,
    startDate,
    endDate,
    startingBalanceMinor
  );

  return {
    startDate,
    endDate,
    startingBalanceMinor,
    endingBalanceMinor,
    projectedChangeMinor:
      subtractMinorUnits(
        endingBalanceMinor,
        startingBalanceMinor
      ),
    events,
    points: buildForecastPoints(
      startDate,
      startingBalanceMinor,
      events
    ),
  };
}
