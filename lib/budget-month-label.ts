import type {
  BudgetMonth,
} from "./budget-types";
import {
  parseBudgetMonth,
} from "./budget-month";

export function formatBudgetMonthLabel(
  month: BudgetMonth
) {
  const parsed =
    parseBudgetMonth(month);

  if (!parsed) {
    return month;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      parsed.year,
      parsed.monthIndex,
      1
    )
  );
}
