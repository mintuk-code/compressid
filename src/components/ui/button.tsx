import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp disabled:pointer-events-none disabled:opacity-50 min-h-11",
  {
    variants: {
      variant: {
        primary: "bg-stamp text-stamp-ink hover:opacity-90",
        quiet: "bg-stamp-soft text-ink hover:opacity-80",
        line: "border border-line bg-surface text-ink hover:border-stamp",
        ghost: "bg-transparent text-ink hover:bg-bg-deep",
      },
      size: {
        md: "px-4 text-base",
        lg: "w-full px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}
