"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-60 bg-[#040a14]/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-60 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gold/25 bg-[#101f35] p-6 shadow-2xl focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition hover:bg-white/10 hover:text-foreground" aria-label="Close">
        <X className="size-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/4 p-1.5", className)} {...props} />
));
TabsList.displayName = "TabsList";
export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn("shrink-0 rounded-xl px-4 py-2 text-xs font-medium text-muted transition hover:text-foreground data-[state=active]:bg-gold/15 data-[state=active]:text-champagne data-[state=active]:shadow-[inset_0_0_0_1px_rgba(216,174,99,0.3)]", className)}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";
export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={cn("mt-6 focus:outline-none", className)} {...props} />);
TabsContent.displayName = "TabsContent";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-white/15 transition-colors data-[state=checked]:bg-gold/80 data-[state=unchecked]:bg-white/10", className)}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block size-4.5 translate-x-1 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5.5" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/8", className)} value={value} {...props}>
    <ProgressPrimitive.Indicator className={cn("h-full rounded-full bg-gradient-to-r from-[#c99a4d] to-[#f2d7a0] transition-transform duration-700", indicatorClassName)} style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }} />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-champagne", className)} {...props} />;
}
