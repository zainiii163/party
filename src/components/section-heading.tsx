import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow, title, description, align = "center", className,
}: {
  eyebrow: string; title: string; description?: string;
  align?: "center" | "left"; className?: string;
}) {
  return (
    <div className={cn("mb-10", align === "center" ? "text-center" : "text-left", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <div className={cn("my-4 h-px w-16 bg-gradient-to-r from-gold to-transparent", align === "center" && "mx-auto")} />
      <h2 className="font-display text-3xl leading-tight tracking-wide text-foreground sm:text-4xl lg:text-[2.8rem]">
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
