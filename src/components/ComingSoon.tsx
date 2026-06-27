export function ComingSoon({
  title,
  emphasis,
  blurb,
  features,
}: {
  title: string;
  emphasis: string;
  blurb: string;
  features: string[];
}) {
  return (
    <div className="glass-shelf rounded-xl p-8 sm:p-12 max-w-3xl">
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">
        Coming next
      </p>
      <h1 className="font-display text-4xl font-bold mb-3">
        {title} <span className="display-em">{emphasis}</span>
      </h1>
      <p className="text-on-surface-variant leading-relaxed mb-6">{blurb}</p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {features.map((f) => (
          <li
            key={f}
            className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3 text-sm"
          >
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
