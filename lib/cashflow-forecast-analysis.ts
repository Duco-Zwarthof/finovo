import type {
  Account,
} from "./account-types";
import {
  buildForecastEvents,
  calculateCashflowForecast,
} from "./cashflow-forecast";
import type {
  CashflowForecast,
} from "./cashflow-forecast-types";
import type {
  RecurringTransaction,
} from "./recurring-transaction-types";
import {
  generateRecurringOccurrences,
  isValidRecurringDate,
} from "./recurring-transactions";

export type ForecastRiskLevel =
  | "healthy"
  | "watch"
  | "risk";

export type ForecastAccountProjection = {
  accountId: string;
  accountName: string;
  startingBalanceMinor: number;
  endingBalanceMinor: number;
  projectedChangeMinor: number;
  lowestBalanceMinor: number;
  lowestBalanceDate: string;
  firstNegativeDate: string | null;
  eventCount: number;
};

export type ForecastHorizonSnapshot = {
  days: 30 | 60 | 90;
  endDate: string;
  endingBalanceMinor: number;
  projectedChangeMinor: number;
  eventCount: number;
};

export type CashflowForecastAnalysis = {
  forecast: CashflowForecast;
  accountProjections: ForecastAccountProjection[];
  horizonSnapshots: ForecastHorizonSnapshot[];
  assignedRecurringCount: number;
  unassignedRecurringCount: number;
  riskLevel: ForecastRiskLevel;
};

const LIQUID_ACCOUNT_TYPES =
  new Set([
    "checking",
    "savings",
    "cash",
  ]);

function isLiquidAccount(
  account: Account
) {
  return (
    account.includedInNetWorth &&
    LIQUID_ACCOUNT_TYPES.has(
      account.type
    )
  );
}

function addDays(
  dateValue: string,
  days: number
) {
  if (
    !isValidRecurringDate(
      dateValue
    )
  ) {
    throw new RangeError(
      "Cannot add days to an invalid forecast date"
    );
  }

  const date =
    new Date(
      `${dateValue}T00:00:00Z`
    );

  date.setUTCDate(
    date.getUTCDate() +
      days
  );

  const year =
    date.getUTCFullYear();

  const month =
    String(
      date.getUTCMonth() +
        1
    ).padStart(2, "0");

  const day =
    String(
      date.getUTCDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function subtractMinorUnits(
  first: number,
  second: number
) {
  const result =
    first - second;

  if (
    !Number.isSafeInteger(
      result
    )
  ) {
    throw new RangeError(
      "Forecast analysis exceeds the safe minor-unit range"
    );
  }

  return result;
}

function buildAccountProjection(
  account: Account,
  recurringItems: readonly RecurringTransaction[],
  startDate: string,
  endDate: string
): ForecastAccountProjection {
  const assignedItems =
    recurringItems.filter(
      (item) =>
        item.accountId ===
        account.id
    );

  const {
    events,
    endingBalanceMinor,
  } = buildForecastEvents(
    assignedItems,
    startDate,
    endDate,
    account.balanceMinor
  );

  let lowestBalanceMinor =
    account.balanceMinor;

  let lowestBalanceDate =
    startDate;

  let firstNegativeDate:
    | string
    | null =
    account.balanceMinor < 0
      ? startDate
      : null;

  for (const event of events) {
    if (
      event.balanceAfterMinor <
      lowestBalanceMinor
    ) {
      lowestBalanceMinor =
        event.balanceAfterMinor;
      lowestBalanceDate =
        event.date;
    }

    if (
      firstNegativeDate ===
        null &&
      event.balanceAfterMinor <
        0
    ) {
      firstNegativeDate =
        event.date;
    }
  }

  return {
    accountId:
      account.id,
    accountName:
      account.name,
    startingBalanceMinor:
      account.balanceMinor,
    endingBalanceMinor,
    projectedChangeMinor:
      subtractMinorUnits(
        endingBalanceMinor,
        account.balanceMinor
      ),
    lowestBalanceMinor,
    lowestBalanceDate,
    firstNegativeDate,
    eventCount:
      events.length,
  };
}

function countAssignmentCoverage(
  recurringItems: readonly RecurringTransaction[],
  liquidAccountIds: ReadonlySet<string>,
  startDate: string,
  endDate: string
) {
  let assignedRecurringCount =
    0;

  let unassignedRecurringCount =
    0;

  for (const item of recurringItems) {
    if (
      !item.isActive ||
      generateRecurringOccurrences(
        item,
        startDate,
        endDate
      ).length === 0
    ) {
      continue;
    }

    if (
      item.accountId &&
      liquidAccountIds.has(
        item.accountId
      )
    ) {
      assignedRecurringCount +=
        1;
    } else {
      unassignedRecurringCount +=
        1;
    }
  }

  return {
    assignedRecurringCount,
    unassignedRecurringCount,
  };
}

function getRiskLevel(
  forecast: CashflowForecast,
  accountProjections: readonly ForecastAccountProjection[],
  unassignedRecurringCount: number
): ForecastRiskLevel {
  if (
    forecast.endingBalanceMinor <
      0 ||
    accountProjections.some(
      (projection) =>
        projection.firstNegativeDate !==
        null
    )
  ) {
    return "risk";
  }

  if (
    forecast.projectedChangeMinor <
      0 ||
    unassignedRecurringCount >
      0
  ) {
    return "watch";
  }

  return "healthy";
}

export function calculateCashflowForecastAnalysis(
  accounts: readonly Account[],
  recurringItems: readonly RecurringTransaction[],
  startDate: string,
  endDate: string
): CashflowForecastAnalysis {
  if (
    !isValidRecurringDate(
      startDate
    ) ||
    !isValidRecurringDate(
      endDate
    ) ||
    endDate < startDate
  ) {
    throw new RangeError(
      "Cannot calculate forecast analysis for an invalid date range"
    );
  }

  const forecast =
    calculateCashflowForecast(
      accounts,
      recurringItems,
      startDate,
      endDate
    );

  const liquidAccounts =
    accounts.filter(
      isLiquidAccount
    );

  const liquidAccountIds =
    new Set(
      liquidAccounts.map(
        (account) =>
          account.id
      )
    );

  const accountProjections =
    liquidAccounts.map(
      (account) =>
        buildAccountProjection(
          account,
          recurringItems,
          startDate,
          endDate
        )
    );

  const {
    assignedRecurringCount,
    unassignedRecurringCount,
  } =
    countAssignmentCoverage(
      recurringItems,
      liquidAccountIds,
      startDate,
      endDate
    );

  return {
    forecast,
    accountProjections,
    horizonSnapshots: (
      [30, 60, 90] as const
    ).map((days) => {
      const horizonForecast =
        calculateCashflowForecast(
          accounts,
          recurringItems,
          startDate,
          addDays(
            startDate,
            days
          )
        );

      return {
        days,
        endDate:
          horizonForecast.endDate,
        endingBalanceMinor:
          horizonForecast.endingBalanceMinor,
        projectedChangeMinor:
          horizonForecast.projectedChangeMinor,
        eventCount:
          horizonForecast.events
            .length,
      };
    }),
    assignedRecurringCount,
    unassignedRecurringCount,
    riskLevel:
      getRiskLevel(
        forecast,
        accountProjections,
        unassignedRecurringCount
      ),
  };
}
