import {
  HardDrive,
  LockKeyhole,
  ServerOff,
} from "lucide-react";

const privacyItems = [
  {
    icon: HardDrive,
    title:
      "Stored in this browser",
    text:
      "Finovo currently keeps your financial data in browser-local storage on this device.",
  },
  {
    icon: ServerOff,
    title:
      "No Finovo cloud sync",
    text:
      "This local-first alpha does not automatically upload your financial data to a Finovo server.",
  },
  {
    icon: LockKeyhole,
    title:
      "You control removal",
    text:
      "You can export a backup, restore previous data or permanently clear Finovo data from this browser.",
  },
] as const;

export default function PrivacyStatusCard() {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-8">
      <div>
        <p className="text-sm font-semibold text-blue-400">
          Privacy status
        </p>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
          Local-first by design
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          A clear overview of how this
          Finovo alpha currently handles
          financial information.
        </p>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {privacyItems.map(
          (item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Icon size={17} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {item.text}
                </p>
              </div>
            );
          }
        )}
      </div>
    </article>
  );
}
