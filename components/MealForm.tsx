"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import type { FormState } from "@/app/actions";
import { CATEGORIES, MEAL_TYPES, type Food, type MealEntry } from "@/lib/nutrition";
import { SubmitButton } from "./buttons";
import { Field, buttonClass, inputClass } from "./ui";

export function MealForm({
  action,
  foods,
  meal,
  defaultDate,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  foods: Food[];
  meal?: MealEntry;
  defaultDate: string;
  submitLabel: string;
  cancelHref?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const amountRef = useRef<HTMLInputElement>(null);
  const err = state.errors ?? {};
  const v = state.values ?? {};

  const grouped = CATEGORIES.map((c) => ({
    category: c,
    items: foods.filter((f) => f.category === c),
  })).filter((g) => g.items.length > 0);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.message && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="날짜" name="date" error={err.date}>
          <input
            id="date"
            name="date"
            type="date"
            className={inputClass}
            defaultValue={v.date ?? meal?.date ?? defaultDate}
            aria-invalid={!!err.date}
            required
          />
        </Field>
        <Field label="식사 구분" name="mealType" error={err.mealType}>
          <select
            id="mealType"
            name="mealType"
            className={inputClass}
            defaultValue={v.mealType ?? meal?.mealType ?? "breakfast"}
            aria-invalid={!!err.mealType}
          >
            {MEAL_TYPES.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="음식" name="foodId" error={err.foodId}>
          <select
            id="foodId"
            name="foodId"
            className={inputClass}
            defaultValue={v.foodId ?? meal?.foodId ?? ""}
            aria-invalid={!!err.foodId}
            required
            onChange={(e) => {
              const food = foods.find((f) => f.id === e.target.value);
              if (food && amountRef.current) amountRef.current.value = String(food.servingSize);
            }}
          >
            <option value="" disabled>
              음식을 선택하세요
            </option>
            {grouped.map((g) => (
              <optgroup key={g.category} label={g.category}>
                {g.items.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.calories} kcal/100g)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="섭취량 (g)" name="amount" error={err.amount} hint="음식을 고르면 1회 제공량이 자동 입력됩니다.">
          <input
            ref={amountRef}
            id="amount"
            name="amount"
            type="number"
            step="any"
            min="0"
            className={inputClass}
            defaultValue={v.amount ?? meal?.amount ?? ""}
            aria-invalid={!!err.amount}
            required
          />
        </Field>
      </div>
      <Field label="메모 (선택)" name="memo">
        <input
          id="memo"
          name="memo"
          maxLength={100}
          className={inputClass}
          defaultValue={v.memo ?? meal?.memo ?? ""}
          placeholder="예: 반 공기만 먹음"
        />
      </Field>

      <div className="flex gap-2">
        <SubmitButton>{submitLabel}</SubmitButton>
        {cancelHref && (
          <Link href={cancelHref} className={buttonClass.secondary}>
            취소
          </Link>
        )}
      </div>
    </form>
  );
}
