import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/*
 * Buttons are square-cornered, flat and decided once:
 *   primary   calendar red — the one main action of a view
 *   ink       solid ink — a strong action that isn't the main one
 *   outline   paper with an ink edge
 *   secondary pale red tint (an active/selected toggle-like action)
 *   ghost     text only
 */
type Variant = "primary" | "ink" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "inline-flex shrink-0 items-center justify-center rounded font-semibold transition-[transform,background-color,border-color,color,opacity] active:scale-[.97] active:duration-75 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-primary/90",
  ink: "bg-fg text-bg hover:bg-fg/85",
  secondary: "bg-primary-soft text-primary-ink hover:bg-primary-track/60",
  ghost: "text-fg hover:bg-fg/[.06]",
  outline: "border border-border-strong bg-surface text-fg hover:border-fg/50 hover:bg-surface-2",
  danger: "text-danger hover:bg-danger/10",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-[0.9375rem] gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-10 w-10",
  "icon-sm": "h-8 w-8",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
