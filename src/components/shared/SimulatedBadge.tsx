/**
 * Shared "this is simulated" labelling. Mount anywhere prices, companies or
 * events are shown. See src/components/shared/README.md for the mount list.
 */
export const SIMULATED_TOOLTIP =
  "All prices, companies, and events in MONEYVERSE are fictional or simulated. No real money.";

export function SimulatedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      role="note"
      title={SIMULATED_TOOLTIP}
      aria-label={SIMULATED_TOOLTIP}
      className={`inline-flex shrink-0 cursor-help items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
      Simulated data
    </span>
  );
}

function formatTime(timestamp?: Date): string {
  const date = timestamp instanceof Date && !Number.isNaN(timestamp.getTime()) ? timestamp : new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Small provenance line: where the data came from and when it last updated. */
export function DataSourceFootnote({
  source,
  timestamp = new Date(),
  className = "",
}: {
  source: string;
  timestamp?: Date;
  className?: string;
}) {
  return (
    <p className={`text-[10px] leading-tight text-slate-500 ${className}`}>
      Source: {source} · Updated {formatTime(timestamp)} · Simulated, not real money
    </p>
  );
}
