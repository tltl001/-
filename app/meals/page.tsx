import type { Metadata } from "next";
import Link from "next/link";
import { createMeal, deleteMeal } from "@/app/actions";
import { DeleteButton } from "@/components/buttons";
import { MealForm } from "@/components/MealForm";
import { Card, EmptyState, PageHeader, ProgressBar, buttonClass, inputClass } from "@/components/ui";
import { getFoods, getGoals, getMealsByDate } from "@/lib/db";
import {
  MEAL_TYPES,
  NUTRIENTS,
  fmt,
  formatDateKo,
  isValidDate,
  scaleNutrients,
  shiftDate,
  sumNutrients,
  todayKST,
} from "@/lib/nutrition";

export const metadata: Metadata = { title: "식단 기록" };

export default async function MealsPage(props: PageProps<"/meals">) {
  const searchParams = await props.searchParams;
  const today = todayKST();
  const date =
    typeof searchParams.date === "string" && isValidDate(searchParams.date) ? searchParams.date : today;

  const [meals, foods, goals] = await Promise.all([getMealsByDate(date), getFoods(), getGoals()]);
  const rows = meals.map((m) => ({ ...m, nutrients: scaleNutrients(m.food, m.amount) }));
  const total = sumNutrients(rows.map((r) => r.nutrients));

  return (
    <>
      <PageHeader title="식단 기록" description={formatDateKo(date)} />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link href={`/meals?date=${shiftDate(date, -1)}`} className={buttonClass.secondary}>
          ← 전날
        </Link>
        <form className="flex gap-2">
          <input type="date" name="date" defaultValue={date} className={`${inputClass} w-auto`} />
          <button className={buttonClass.secondary}>이동</button>
        </form>
        <Link href={`/meals?date=${shiftDate(date, 1)}`} className={buttonClass.secondary}>
          다음날 →
        </Link>
        {date !== today && (
          <Link href="/meals" className={`${buttonClass.link} ml-2`}>
            오늘로
          </Link>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          {meals.length === 0 && <EmptyState>이 날짜에 기록된 식단이 없습니다. 오른쪽에서 추가해 보세요.</EmptyState>}
          {MEAL_TYPES.map((t) => {
            const items = rows.filter((r) => r.mealType === t.key);
            if (items.length === 0) return null;
            const subtotal = sumNutrients(items.map((i) => i.nutrients));
            return (
              <Card key={t.key} className="p-0">
                <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
                  <h2 className="font-semibold text-stone-900">{t.label}</h2>
                  <span className="text-sm tabular-nums text-stone-500">
                    {fmt(subtotal.calories, 0)} kcal · 단 {fmt(subtotal.protein)} · 탄 {fmt(subtotal.carbs)} · 지{" "}
                    {fmt(subtotal.fat)}g
                  </span>
                </div>
                <ul className="divide-y divide-stone-100">
                  {items.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                      <div>
                        <Link href={`/foods/${m.food.id}`} className="font-medium text-stone-900 hover:underline">
                          {m.food.name}
                        </Link>
                        <span className="ml-2 text-sm text-stone-500">{fmt(m.amount)}g</span>
                        {m.memo && <p className="text-xs text-stone-400">{m.memo}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm tabular-nums text-stone-700">
                          {fmt(m.nutrients.calories, 0)} kcal
                        </span>
                        <Link href={`/meals/${m.id}/edit`} className={buttonClass.link}>
                          수정
                        </Link>
                        <DeleteButton
                          small
                          action={deleteMeal.bind(null, m.id)}
                          confirmMessage={`${t.label} - '${m.food.name}' 기록을 삭제할까요?`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-semibold text-stone-900">기록 추가</h2>
            {foods.length === 0 ? (
              <EmptyState href="/foods/new" cta="음식 등록하기">
                먼저 음식을 등록해야 합니다.
              </EmptyState>
            ) : (
              <MealForm key={date} action={createMeal} foods={foods} defaultDate={date} submitLabel="추가" />
            )}
          </Card>
          <Card>
            <h2 className="mb-4 font-semibold text-stone-900">하루 합계</h2>
            <div className="flex flex-col gap-3">
              {NUTRIENTS.map((n) => (
                <ProgressBar
                  key={n.key}
                  label={n.label}
                  value={total[n.key]}
                  goal={goals[n.key]}
                  unit={n.unit}
                  isLimit={n.key === "sodium"}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
