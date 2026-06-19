import { cn } from "@/lib/utils";

export default function Avatar({ initials, color = "from-violet-400 to-fuchsia-500", size = "md", online, ring }) {
  const sizes = {
    xs: "h-8 w-8 text-xs",
    sm: "h-10 w-10 text-sm",
    md: "h-12 w-12 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-24 w-24 text-2xl",
    "2xl": "h-32 w-32 text-4xl",
  };
  const dot = { xs: "h-2 w-2", sm: "h-2.5 w-2.5", md: "h-3 w-3", lg: "h-3.5 w-3.5", xl: "h-4 w-4", "2xl": "h-5 w-5" };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          "rounded-full bg-gradient-to-br grid place-items-center font-semibold text-white shadow-bubble",
          sizes[size],
          color,
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
