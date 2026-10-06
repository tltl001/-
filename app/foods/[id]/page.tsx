import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteFood } from "@/app/actions";
import { DeleteButton } from "@/components/buttons";
import { Card, MacroBar, PageHeader, buttonClass } from "@/components/ui";
import { countMealsForFood, getFood } from "@/lib/db";
import { NUTRIENTS, fmt, macroRatio, scaleNutrients } from "@/lib/nutrition";

export async function generateMetadata(props: PageProps<"/foods/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const food = await getFood(id);
  return { title: food?.name ?? "음식" };
}

export default async function FoodDetailPage(props: PageProps<"/foods/[id]">) {
  const { id } = await props.params;
  const [food, usage] = await Promise.all([getFood(id), countMealsForFood(id)]);
  if (!food) notFound();

  const serving = scaleNutrients(food, food.servingSize);
  const ratio = macroRatio(food);

  return (
    <>
      <Link href="/foods" className={buttonClass.link}>
        ← 음식 목록
      </Link>
      <div className="mt-3">
        <PageHeader
          title={food.name}
          description={
            <>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{food.category}</span>
              <span className="ml-2">식단 기록 {usage}건에서 사용 중</span>
            </>
          }
          actions={
            <>
              <Link href={`/foods/${food.id}/edit`} className={buttonClass.secondary}>
                수정
              </Link>
              <DeleteButton
                action={deleteFood.bind(null, food.id)}
                confirmMessage={
                  usage > 0
                    ? `'${food.name}'을(를) 삭제할까요?\n이 음식이 포함된 식단 기록 ${usage}건도 함께 삭제됩니다.`
                    : `'${food.name}'을(를) 삭제할까요?`
                }
              />
            </>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <h2 className="mb-4 font-semibold text-stone-900">영양성분표</h2>
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 text-left text-xs text-stone-500">
              <tr>
                <th className="py-2 font-medium">성분</th>
                <th className="py-2 text-right font-medium">100g 당</th>
                <th className="py-2 text-right font-medium">1회 제공량 ({fmt(food.servingSize)}g) 당</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {NUTRIENTS.map((n) => (
                <tr key={n.key}>
                  <td className="py-2.5 text-stone-700">{n.label}</td>
                  <td className="py-2.5 text-right tabular-nums">
                    {fmt(food[n.key])} {n.unit}
                  </td>
                  <td className="py-2.5 text-right font-medium tabular-nums text-stone-900">
                    {fmt(serving[n.key])} {n.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-3 font-semibold text-stone-900">열량 구성비</h2>
            <MacroBar {...ratio} />
            <p className="mt-3 text-xs text-stone-400">탄수화물·단백질 4kcal/g, 지방 9kcal/g 기준</p>
          </Card>
          {food.note && (
            <Card>
              <h2 className="mb-2 font-semibold text-stone-900">메모</h2>
              <p className="whitespace-pre-wrap text-sm text-stone-600">{food.note}</p>
            </Card>
          )}
          <p className="px-1 text-xs text-stone-400">
            등록 {new Date(food.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
            <br />
            수정 {new Date(food.updatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
          </p>
        </div>
      </div>
    </>
  );
}
