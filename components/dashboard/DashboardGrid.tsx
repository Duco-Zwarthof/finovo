"use client";

import type { ReactNode } from "react";

import {
  Responsive,
  useContainerWidth,
  type Layout,
} from "react-grid-layout";
import { verticalCompactor } from "react-grid-layout/core";
import {
  EyeOff,
  GripVertical,
} from "lucide-react";

import { getWidgetTitle } from "@/lib/dashboard-helpers";
import type {
  DashboardBreakpoint,
  DashboardLayouts,
  WidgetId,
} from "@/lib/storage";

type DashboardGridProps = {
  mounted: boolean;
  isEditMode: boolean;
  visibleWidgetIds: readonly WidgetId[];
  visibleLayouts: DashboardLayouts;
  onChooseWidgets: () => void;
  onLayoutChange: (
    currentLayout: Layout,
    allLayouts: DashboardLayouts
  ) => void;
  renderWidget: (widgetId: WidgetId) => ReactNode;
};

export default function DashboardGrid({
  mounted,
  isEditMode,
  visibleWidgetIds,
  visibleLayouts,
  onChooseWidgets,
  onLayoutChange,
  renderWidget,
}: DashboardGridProps) {
  const { width, containerRef } =
    useContainerWidth({
      measureBeforeMount: true,
    });

  return (
    <div ref={containerRef}>
      {mounted &&
        (visibleWidgetIds.length === 0 ? (
          <section className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <EyeOff
              size={26}
              className="text-zinc-500"
            />

            <h2 className="mt-5 text-xl font-bold">
              Your dashboard is empty
            </h2>

            <button
              type="button"
              onClick={onChooseWidgets}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Choose widgets
            </button>
          </section>
        ) : (
          <Responsive<DashboardBreakpoint>
            width={width}
            layouts={visibleLayouts}
            breakpoints={{
              lg: 1200,
              md: 996,
              sm: 768,
              xs: 0,
            }}
            cols={{
              lg: 12,
              md: 10,
              sm: 6,
              xs: 4,
            }}
            rowHeight={72}
            margin={[20, 20]}
            containerPadding={[0, 0]}
            dragConfig={{
              enabled: isEditMode,
              handle: ".finovo-drag-handle",
              bounded: false,
              threshold: 3,
            }}
            resizeConfig={{
              enabled: isEditMode,
              handles: ["se"],
            }}
            compactor={verticalCompactor}
            onLayoutChange={onLayoutChange}
          >
            {visibleWidgetIds.map((widgetId) => (
              <div
                key={widgetId}
                className={`group relative ${
                  isEditMode
                    ? "finovo-widget-editing"
                    : ""
                }`}
              >
                {isEditMode && (
                  <button
                    type="button"
                    aria-label={`Move ${getWidgetTitle(widgetId)} widget`}
                    className="finovo-drag-handle absolute right-4 top-4 z-30 flex h-9 w-9 cursor-grab items-center justify-center rounded-xl border border-white/10 bg-zinc-950/90 text-zinc-400 shadow-lg backdrop-blur transition hover:text-white active:cursor-grabbing"
                  >
                    <GripVertical size={17} />
                  </button>
                )}

                {renderWidget(widgetId)}
              </div>
            ))}
          </Responsive>
        ))}
    </div>
  );
}
