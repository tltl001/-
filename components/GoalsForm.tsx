"use client";

import { useActionState } from "react";
import { updateGoals } from "@/app/actions";
import { NUTRIENTS, type Goals } from "@/lib/nutrition";
import { SubmitButton } from "./buttons";
import { Field, inputClass } from "./ui";

export function GoalsForm({ goals }: { goals: Goals }) {
  const [state, formAction] = useActionState(updateGoals, {});
  const err = state.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.message && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{state.message}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {NUTRIENTS.map((n) => (
          <Field
            key={n.key}
            label={`${n.label} (${n.unit})`}
            name={n.key}
            error={err[n.key]}
            hint={n.key === "sodium" ? "나트륨은 하루 섭취 상한으로 사용됩니다." : undefined}
          >
            <input
              id={n.key}
              name={n.key}
              type="number"
              step="any"
              min="0"
              className={inputClass}
              defaultValue={state.values?.[n.key] ?? goals[n.key]}
              aria-invalid={!!err[n.key]}
              required
            />
          </Field>
        ))}
      </div>
      <div>
        <SubmitButton>목표 저장</SubmitButton>
      </div>
    </form>
  );
}
