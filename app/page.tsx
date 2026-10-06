import Link from "next/link";
import { Card, EmptyState, MacroBar, PageHeader, ProgressBar, buttonClass } from "@/components/ui";
import { getGoals, getMealsByDate, getStats } from "@/lib/db";
import {
  MEAL_TYPES,
  NUTRIENTS,
  fmt,
  formatDateKo,
  macroRatio,
  scaleNutrients,
  sumNutrients,
  todayKST,
} from "@/lib/nutrition";

export default async function DashboardPage() {
  const today = todayKST();
  const [meals, goals, stats] = await Promise.all([getMealsByDate(today), getGoals(), getStats()]);
  const total = sumNutrients(meals.map((m) => scaleNutrients(m.food, m.amount)));
  const ratio = macroRatio(total);
  const remaining = goals.calories - total.calories;

  return (
    <>
      <PageHeader
        title="오늘의 영양"
        description={formatDateKo(today)}
        actions={
          <Link href="/meals" className={buttonClass.primary}>
            + 식단 기록하기
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <p className="text-sm text-stone-500">섭취 열량</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-stone-900">
            {fmt(total.calories, 0)}
            <span className="ml-1 text-base font-medium text-stone-400">kcal</span>
          </p>
          <p className={`mt-2 text-sm ${remaining >= 0 ? "text-emerald-700" : "text-amber-600"}`}>
            {remaining >= 0
              ? `목표까지 ${fmt(remaining, 0)} kcal 남음`
              : `목표보다 ${fmt(-remaining, 0)} kcal 초과`}
          </p>
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-stone-700">열량 구성비</p>
            <MacroBar {...ratio} />
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="mb-4 font-semibold text-stone-900">목표 대비 섭취량</h2>
          <div className="grid gap-4 sm:grid-cols-2">
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
          <Link href="/goals" className={`${buttonClass.link} mt-4 inline-block`}>
            목표 수정 →
          </Link>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">오늘 먹은 음식</h2>
            <Link href={`/meals?date=${today}`} className={buttonClass.link}>
              전체 보기 →
            </Link>
          </div>
          {meals.length === 0 ? (
            <EmptyState href="/meals" cta="첫 기록 추가">
              아직 오늘 기록된 식단이 없습니다.
            </EmptyState>
          ) : (
            <div className="flex flex-col gap-4">
              {MEAL_TYPES.map((t) => {
                const items = meals.filter((m) => m.mealType === t.key);
                if (items.length === 0) return null;
                const kcal = items.reduce((s, m) => s + (m.food.calories * m.amount) / 100, 0);
                return (
                  <div key={t.key}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-stone-700">{t.label}</span>
                      <span className="tabular-nums text-stone-500">{fmt(kcal, 0)} kcal</span>
                    </div>
                    <p className="text-sm text-stone-600">
                      {items.map((m) => `${m.food.name} ${fmt(m.amount, 0)}g`).join(" · ")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-stone-900">기록 현황</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            {[
              ["등록된 음식", `${stats.foodCount}개`, "/foods"],
              ["전체 식단 기록", `${stats.mealCount}건`, "/meals"],
              ["기록한 날", `${stats.loggedDays}일`, "/meals"],
            ].map(([label, value, href]) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2.5 hover:bg-stone-100"
              >
                <dt className="text-stone-500">{label}</dt>
                <dd className="font-semibold tabular-nums text-stone-900">{value}</dd>
              </Link>
            ))}
          </dl>
        </Card>
      </div>
    </>
  );
}
