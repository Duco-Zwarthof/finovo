export type NetWorthSnapshot = {
  id: string;
  date: string;
  netWorthMinor: number;
};

export type NetWorthHistorySummary = {
  firstSnapshot: NetWorthSnapshot | null;
  latestSnapshot: NetWorthSnapshot | null;
  changeMinor: number;
  changePercentage: number | null;
  highestSnapshot: NetWorthSnapshot | null;
  lowestSnapshot: NetWorthSnapshot | null;
};
