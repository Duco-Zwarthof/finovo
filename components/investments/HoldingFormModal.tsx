"use client";

import { FormEvent, useState } from "react";
import { Trash2, X } from "lucide-react";

import {
  INVESTMENT_ASSET_TYPES,
  type InvestmentAssetType,
  type InvestmentHolding,
} from "@/lib/investment-types";
import { isValidInvestmentHolding } from "@/lib/investments";
import { CURRENCY_SYMBOL } from "@/lib/money";
import {
  amountMinorToEuroAmount,
  euroAmountToMinor,
} from "@/lib/transaction-amount";

type HoldingFormModalProps = {
  holding?: InvestmentHolding;
  onClose: () => void;
  onSave: (holding: InvestmentHolding) => void;
  onDelete?: (holdingId: string) => void;
};

type ValidationErrors = {
  name?: string;
  symbol?: string;
  quantity?: string;
  averageBuyPrice?: string;
  currentPrice?: string;
};

const assetTypeLabels: Record<InvestmentAssetType, string> = {
  etf: "ETF",
  stock: "Stock",
  crypto: "Crypto",
  bond: "Bond",
  fund: "Fund",
  other: "Other",
};

function initialMoneyValue(amountMinor?: number) {
  if (amountMinor === undefined) {
    return "";
  }

  const euroAmount =
    amountMinorToEuroAmount(amountMinor);

  return euroAmount === null
    ? ""
    : String(euroAmount);
}

export default function HoldingFormModal({
  holding,
  onClose,
  onSave,
  onDelete,
}: HoldingFormModalProps) {
  const isEditing = Boolean(holding);

  const [name, setName] = useState(
    holding?.name ?? ""
  );
  const [symbol, setSymbol] = useState(
    holding?.symbol ?? ""
  );
  const [assetType, setAssetType] =
    useState<InvestmentAssetType>(
      holding?.assetType ?? "etf"
    );
  const [quantity, setQuantity] = useState(
    holding ? String(holding.quantity) : ""
  );
  const [averageBuyPrice, setAverageBuyPrice] =
    useState(
      initialMoneyValue(
        holding?.averageBuyPriceMinor
      )
    );
  const [currentPrice, setCurrentPrice] =
    useState(
      initialMoneyValue(
        holding?.currentPriceMinor
      )
    );

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const nextErrors: ValidationErrors = {};
    const parsedQuantity = Number(quantity);
    const averageBuyPriceMinor =
      euroAmountToMinor(averageBuyPrice);
    const currentPriceMinor =
      euroAmountToMinor(currentPrice);

    if (!name.trim()) {
      nextErrors.name = "Enter a holding name.";
    }

    if (!symbol.trim()) {
      nextErrors.symbol = "Enter a symbol.";
    }

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      nextErrors.quantity =
        "Enter a quantity greater than zero.";
    }

    if (averageBuyPriceMinor === null) {
      nextErrors.averageBuyPrice =
        "Enter a valid average buy price.";
    }

    if (currentPriceMinor === null) {
      nextErrors.currentPrice =
        "Enter a valid current price.";
    }

    setErrors(nextErrors);

    if (
      Object.keys(nextErrors).length > 0 ||
      averageBuyPriceMinor === null ||
      currentPriceMinor === null
    ) {
      return;
    }

    const savedHolding: InvestmentHolding = {
      id: holding?.id ?? crypto.randomUUID(),
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      assetType,
      quantity: parsedQuantity,
      averageBuyPriceMinor,
      currentPriceMinor,
    };

    if (!isValidInvestmentHolding(savedHolding)) {
      return;
    }

    onSave(savedHolding);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="holding-form-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-7 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="holding-form-title"
              className="text-2xl font-bold text-white"
            >
              {isEditing
                ? "Edit holding"
                : "Add holding"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Add the current details for an ETF,
              stock, crypto or other investment.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close holding form"
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="holding-name"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Name
              </label>

              <input
                id="holding-name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Vanguard FTSE All-World"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
              />

              {errors.name && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="holding-symbol"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Symbol
              </label>

              <input
                id="holding-symbol"
                value={symbol}
                onChange={(event) =>
                  setSymbol(event.target.value)
                }
                placeholder="VWCE"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
              />

              {errors.symbol && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.symbol}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="holding-type"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Asset type
            </label>

            <select
              id="holding-type"
              value={assetType}
              onChange={(event) =>
                setAssetType(
                  event.target
                    .value as InvestmentAssetType
                )
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              {INVESTMENT_ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {assetTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="holding-quantity"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Quantity
            </label>

            <input
              id="holding-quantity"
              type="number"
              min="0.00000001"
              step="any"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              placeholder="10"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
            />

            {errors.quantity && (
              <p className="mt-2 text-sm text-red-400">
                {errors.quantity}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="holding-average-price"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Average buy price
              </label>

              <div className="flex rounded-xl border border-white/10 bg-zinc-950 focus-within:border-blue-500">
                <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">
                  {CURRENCY_SYMBOL}
                </span>

                <input
                  id="holding-average-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={averageBuyPrice}
                  onChange={(event) =>
                    setAverageBuyPrice(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  className="w-full rounded-r-xl bg-transparent px-4 py-3 text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              {errors.averageBuyPrice && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.averageBuyPrice}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="holding-current-price"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Current price
              </label>

              <div className="flex rounded-xl border border-white/10 bg-zinc-950 focus-within:border-blue-500">
                <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">
                  {CURRENCY_SYMBOL}
                </span>

                <input
                  id="holding-current-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentPrice}
                  onChange={(event) =>
                    setCurrentPrice(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  className="w-full rounded-r-xl bg-transparent px-4 py-3 text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              {errors.currentPrice && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.currentPrice}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            {isEditing && holding && onDelete && (
              <button
                type="button"
                onClick={() =>
                  onDelete(holding.id)
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10"
              >
                <Trash2 size={17} />
                Delete
              </button>
            )}

            <div className="flex flex-1 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                {isEditing
                  ? "Save changes"
                  : "Add holding"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
