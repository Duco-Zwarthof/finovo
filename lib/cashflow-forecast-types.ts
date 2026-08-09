export type CashflowForecastEvent = {
  id: string;
  recurringTransactionId: string;
  title: string;
  category: string;
  type: "income" | "expense";
  date: string;
  amountMinor: number;
  balanceAfterMinor: number;
};

export type CashflowForecastPoint = {
  date: string;
  balanceMinor: number;
};

export type CashflowForecast = {
  startDate: string;
  endDate: string;
  startingBalanceMinor: number;
  endingBalanceMinor: number;
  projectedChangeMinor: number;
  events: CashflowForecastEvent[];
  points: CashflowForecastPoint[];
};
