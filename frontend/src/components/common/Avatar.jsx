import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-orange-400",
  "from-amber-400 to-pink-500",
  "from-indigo-500 to-purple-600",
];

// Helper to hash initials to a stable gradient index
const getGradient = (str) => {
  if (!str) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

export default function Avatar({ initials, color, size = "md", online, ring }) {
  const sizes = {
    xs: "h-8 w-8 text-xs",
    sm: "h-10 w-10 text-sm",
    md: "h-12 w-12 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-24 w-24 text-2xl",
    "2xl": "h-32 w-32 text-4xl",
  };
  const dot = { xs: "h-2 w-2", sm: "h-2.5 w-2.5", md: "h-3 w-3", lg: "h-3.5 w-3.5", xl: "h-4 w-4", "2xl": "h-5 w-5" };

  const avatarColor = color || getGradient(initials);

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          "rounded-full bg-gradient-to-br grid place-items-center font-semibold text-white shadow-bubble",
          sizes[size],
          avatarColor,
          ring && "ring-4 ring-background"
        )}
      >
        {initials}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0">
          <span className={cn("absolute inset-0 rounded-full bg-emerald-400/50 animate-pulse-ring", dot[size])} />
          <span className={cn("relative block rounded-full bg-emerald-400 ring-2 ring-background", dot[size])} />
        </span>
      )}
    </div>
  );
}

