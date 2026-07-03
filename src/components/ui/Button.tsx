import Link from "next/link";
import { clsx } from "@/lib/clsx";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-full font-sans text-base font-semibold transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  // Solid gold pill with dark text — like "Apply to join".
  primary:
    "bg-gold-cta text-[#15110A] px-[30px] py-[15px] hover:bg-gold-hi active:translate-y-px",
  // Dark pill with subtle border — like "How it works".
  secondary:
    "bg-[#0C0B09] text-paper border border-line px-[30px] py-[15px] hover:bg-card",
  ghost:
    "bg-transparent text-muted text-sm underline underline-offset-[3px] px-0.5 py-2 hover:text-body rounded-none",
};

interface Common {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  href,
}: Common & { href: string }) {
  return (
    <Link href={href} className={clsx(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

/** Small right-arrow glyph used across CTAs. */
export function Arrow() {
  return <span className="text-lg leading-none">→</span>;
}
