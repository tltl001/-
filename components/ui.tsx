import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { fmt } from "@/lib/nutrition";

export const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 aria-invalid:border-red-500";

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-1 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100",
  danger:
    "inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60",
  link: "text-sm font-medium text-emerald-700 hover:underline",
};

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return (
    <section
      className={`rounded-2xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-stone-400">{hint}</p>
      )}
    </div>
  );
}

export function ProgressBar({
  label,
  value,
  goal,
  unit,
  isLimit = false,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  isLimit?: boolean;
}) {
  const pct = goal > 0 ? (value / goal) * 100 : 0;
  const over = pct > 100;
  const color = over ? (isLimit ? "bg-red-500" : "bg-amber-500") : "bg-emerald-600";
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-stone-700">
          {label}
          {isLimit && <span className="ml-1 text-xs text-stone-400">(상한)</span>}
        </span>
        <span className="tabular-nums text-stone-500">
          <span className={over && isLimit ? "font-semibold text-red-600" : "font-semibold text-stone-800"}>
            {fmt(value)}
          </span>{" "}
          / {fmt(goal)} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

export function MacroBar({ carbs, protein, fat }: { carbs: number; protein: number; fat: number }) {
  const parts = [
    { label: "탄수화물", value: carbs, color: "bg-amber-400" },
    { label: "단백질", value: protein, color: "bg-emerald-600" },
    { label: "지방", value: fat, color: "bg-sky-500" },
  ];
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-stone-100">
        {parts.map((p) => (
          <div key={p.label} className={p.color} style={{ width: `${p.value}%` }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
        {parts.map((p) => (
          <span key={p.label} className="inline-flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${p.color}`} />
            {p.label} <span className="tabular-nums font-medium">{fmt(p.value, 0)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ children, href, cta }: { children: ReactNode; href?: string; cta?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 px-6 py-10 text-center text-sm text-stone-500">
      <p>{children}</p>
      {href && cta && (
        <Link href={href} className={`${buttonClass.primary} mt-4`}>
          {cta}
        </Link>
      )}
    </div>
  );
}
