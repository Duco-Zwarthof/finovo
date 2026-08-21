import {
  Database,
  Settings2,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import DataExportCard from "@/components/settings/DataExportCard";
import DataImportCard from "@/components/settings/DataImportCard";
import DeleteLocalDataCard from "@/components/settings/DeleteLocalDataCard";
import LocalSnapshotsCard from "@/components/settings/LocalSnapshotsCard";
import PrivacyStatusCard from "@/components/settings/PrivacyStatusCard";

export default function SettingsPage() {
  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        <header className="max-w-3xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Settings2 size={17} />
            Settings
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your data, your control.
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Manage local Finovo data
            and privacy controls for
            this browser.
          </p>
        </header>

        <section
          aria-labelledby="privacy-settings-title"
          className="mt-10"
        >
          <div className="mb-4">
            <h2
              id="privacy-settings-title"
              className="text-lg font-semibold text-white"
            >
              Privacy
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Understand where your
              Finovo data currently
              lives.
            </p>
          </div>

          <PrivacyStatusCard />
        </section>

        <section
          aria-labelledby="data-settings-title"
          className="mt-10"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400">
              <Database size={18} />
            </div>

            <div>
              <h2
                id="data-settings-title"
                className="text-lg font-semibold text-white"
              >
                Data
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Automatic restore
                points, backups and
                local data controls.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <LocalSnapshotsCard />
            <DataExportCard />
            <DataImportCard />
            <DeleteLocalDataCard />
          </div>
        </section>
      </section>
    </main>
  );
}
