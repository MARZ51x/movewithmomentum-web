import { initials } from "@/lib/format";

export function Avatar({
  name,
  size = 40,
  verified = false,
}: {
  name: string;
  size?: number;
  verified?: boolean;
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className="grid place-items-center rounded-full bg-surface-high text-on-surface font-semibold border border-white/10"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        aria-hidden
      >
        {initials(name)}
      </span>
      {verified && (
        <span
          className="absolute -bottom-1 -right-1 grid place-items-center rounded-full bg-secondary text-on-secondary text-[10px] size-4 border border-surface"
          title="Verified Agent"
          aria-label="Verified Agent"
        >
          ★
        </span>
      )}
    </span>
  );
}
