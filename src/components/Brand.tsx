import Link from "next/link";

/** Wordmark used across public + gated surfaces. */
export function Brand({
  size = "md",
  href = "/",
}: {
  size?: "sm" | "md" | "lg";
  href?: string;
}) {
  const scale =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <Link href={href} className="inline-flex items-center gap-2 group">
      <span
        className="grid place-items-center rounded-md bg-secondary text-on-secondary font-display font-bold leading-none size-8 glow-gold"
        aria-hidden
      >
        M
      </span>
      <span className={`font-display font-bold tracking-tight ${scale}`}>
        Move<span className="display-em not-italic text-secondary">With</span>
        Momentum
      </span>
    </Link>
  );
}
