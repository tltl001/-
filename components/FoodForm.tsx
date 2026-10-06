"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/app/actions";
import { CATEGORIES, NUTRIENTS, type Food } from "@/lib/nutrition";
import { SubmitButton } from "./buttons";
import { Field, buttonClass, inputClass } from "./ui";

export function FoodForm({
  action,
  food,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  food?: Food;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const value = (key: string) =>
    state.values?.[key] ?? (food ? String(food[key as keyof Food]) : "");
  const err = state.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.message && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="음식 이름" name="name" error={err.name}>
          <input
            id="name"
            name="name"
            className={inputClass}
            defaultValue={value("name")}
            aria-invalid={!!err.name}
            placeholder="예: 현미밥"
            required
          />
        </Field>
        <Field label="분류" name="category" error={err.category}>
          <select
            id="category"
            name="category"
            className={inputClass}
            defaultValue={value("category")}
            aria-invalid={!!err.category}
            required
          >
            <option value="" disabled>
              선택하세요
            </option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field
          label="1회 제공량 (g)"
          name="servingSize"
          error={err.servingSize}
          hint="식단 기록 시 섭취량 기본값으로 사용됩니다."
        >
          <input
            id="servingSize"
            name="servingSize"
            type="number"
            step="any"
            min="0"
            className={inputClass}
            defaultValue={value("servingSize")}
            aria-invalid={!!err.servingSize}
            required
          />
        </Field>
      </div>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">영양성분 (100g 기준)</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          {NUTRIENTS.map((n) => (
            <Field key={n.key} label={`${n.label} (${n.unit})`} name={n.key} error={err[n.key]}>
              <input
                id={n.key}
                name={n.key}
                type="number"
                step="any"
                min="0"
                className={inputClass}
                defaultValue={value(n.key)}
                aria-invalid={!!err[n.key]}
                required
              />
            </Field>
          ))}
        </div>
      </fieldset>

      <Field label="메모 (선택)" name="note">
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={300}
          className={inputClass}
          defaultValue={value("note")}
          placeholder="조리법, 출처 등"
        />
      </Field>

      <div className="flex gap-2">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Link href={cancelHref} className={buttonClass.secondary}>
          취소
        </Link>
      </div>
    </form>
  );
}
