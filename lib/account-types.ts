export const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "investment",
  "cash",
] as const;

export type AccountType =
  (typeof ACCOUNT_TYPES)[number];

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balanceMinor: number;
  includedInNetWorth: boolean;
};