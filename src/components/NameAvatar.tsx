interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

// Stable hue from name so avatars feel personal and don't all look alike.
function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function NameAvatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const hue = hueFromName(name);
  const bg = `linear-gradient(135deg, hsl(${hue} 80% 78%) 0%, hsl(${(hue + 40) % 360} 85% 70%) 100%)`;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-foreground/90 shadow-soft ring-2 ring-white ${sizes[size]} ${className}`}
      style={{ background: bg }}
    >
      {initials || "?"}
    </div>
  );
}
