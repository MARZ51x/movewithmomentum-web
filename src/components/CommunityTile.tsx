import type { Community } from "@/lib/communities";

/** Generated gradient "photo" swatch keyed off the community hue — keeps the app self-contained. */
export function CommunityTile({
  community,
  size = 64,
}: {
  community: Community;
  size?: number;
}) {
  const h = community.hue;
  return (
    <span
      className="shrink-0 rounded-lg border border-white/10 grid place-items-center font-display font-bold text-white/90"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, hsl(${h} 60% 32%), hsl(${(h + 40) % 360} 55% 18%))`,
      }}
      aria-hidden
    >
      {community.name.charAt(0)}
    </span>
  );
}
