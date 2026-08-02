type StorageNoticeProps = {
  title: string;
  message: string | null;
  className?: string;
};

export default function StorageNotice({
  title,
  message,
  className = "mt-6",
}: StorageNoticeProps) {
  if (!message) {
    return null;
  }

  return (
    <aside
      role="status"
      className={`${className} rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3`}
    >
      <p className="text-sm font-semibold text-amber-200">
        {title}
      </p>

      <p className="mt-1 text-sm leading-6 text-amber-100/75">
        {message}
      </p>
    </aside>
  );
}
