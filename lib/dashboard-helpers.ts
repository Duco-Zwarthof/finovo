import type { Layout } from "react-grid-layout";

import { widgetOptions } from "./dashboard-config";
import {
  STORAGE_KEYS,
  type StorageReadStatus,
  type WidgetId,
  type WidgetSettings,
} from "./storage";

export type StorageArea = keyof typeof STORAGE_KEYS;

export type StorageHealth =
  | StorageReadStatus
  | "write-failed";

export type StorageHealthState = Record<
  StorageArea,
  StorageHealth
>;

export function isWidgetId(
  value: string
): value is WidgetId {
  return widgetOptions.some(
    (widget) => widget.key === value
  );
}

export function getWidgetTitle(
  widgetId: WidgetId
): string {
  return (
    widgetOptions.find(
      (widget) => widget.key === widgetId
    )?.title ?? widgetId
  );
}

export function formatSurplusRate(
  rate: number | null
): string {
  if (rate === null) {
    return "Not available";
  }

  const roundedRate = Math.round(rate * 10) / 10;

  if (roundedRate === 0 && rate < 0) {
    return "Below 0%";
  }

  return `${roundedRate}%`;
}

export function getDashboardStorageNotice(
  storageHealth: StorageHealthState
): string | null {
  const statuses = Object.values(storageHealth);

  if (
    statuses.includes("unavailable") ||
    statuses.includes("write-failed")
  ) {
    return "Changes could not be saved in this browser. They may be lost when you reload the page.";
  }

  if (statuses.includes("invalid")) {
    return "Some saved dashboard data was invalid, so safe defaults are shown instead.";
  }

  if (statuses.includes("recovered")) {
    return "Some invalid saved data was ignored. Valid transactions and dashboard preferences were preserved.";
  }

  return null;
}

export function filterDashboardLayout(
  layout: Layout | undefined,
  widgetSettings: WidgetSettings
): Layout {
  if (!layout) {
    return [];
  }

  return layout.filter((item) => {
    if (!isWidgetId(item.i)) {
      return false;
    }

    return widgetSettings[item.i];
  });
}
