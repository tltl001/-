import type { Metadata } from "next";
import Link from "next/link";
import { deleteFood } from "@/app/actions";
import { DeleteButton } from "@/components/buttons";
import { EmptyState, PageHeader, buttonClass, inputClass } from "@/components/ui";
import { getFoods } from "@/lib/db";
import { CATEGORIES, fmt } from "@/lib/nutrition";

export const metadata: Metadata = { title: "음식 DB" };

export default async function FoodsPage(props: PageProps<"/foods">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";

  const allFoods = await getFoods();
  const foods = allFoods.filter(
    (f) => (!q || f.name.toLowerCase().includes(q.toLowerCase())) && (!category || f.category === category),
  );

  return (
    <>
      <PageHeader
        title="음식 데이터베이스"
        description={`등록된 음식 ${allFoods.length}개 · 영양성분은 100g 기준`}
        actions={
          <Link href="/foods/new" className={buttonClass.primary}>
            + 음식 추가
          </Link>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="음식 이름 검색"
          className={`${inputClass} max-w-xs flex-1`}
        />
        <select name="category" defaultValue={category} className={`${inputClass} w-auto`}>
          <option value="">전체 분류</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className={buttonClass.secondary}>검색</button>
        {(q || category) && (
          <Link href="/foods" className={buttonClass.link + " self-center"}>
            초기화
          </Link>
        )}
      </form>

      {foods.length === 0 ? (
        <EmptyState href="/foods/new" cta="음식 추가">
          {q || category ? "검색 결과가 없습니다." : "등록된 음식이 없습니다."}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">이름</th>
                <th className="px-4 py-3 font-medium">분류</th>
                <th className="px-4 py-3 text-right font-medium">열량</th>
                <th className="px-4 py-3 text-right font-medium">단백질</th>
                <th className="px-4 py-3 text-right font-medium">탄수화물</th>
                <th className="px-4 py-3 text-right font-medium">지방</th>
                <th className="px-4 py-3 text-right font-medium">1회 제공량</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {foods.map((f) => (
                <tr key={f.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-900">
                    <Link href={`/foods/${f.id}`} className="hover:text-emerald-700 hover:underline">
                      {f.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{f.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(f.calories)} kcal</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(f.protein)}g</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(f.carbs)}g</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(f.fat)}g</td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-500">{fmt(f.servingSize)}g</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/foods/${f.id}/edit`} className={buttonClass.link}>
                        수정
                      </Link>
                      <DeleteButton
                        small
                        action={deleteFood.bind(null, f.id)}
                        confirmMessage={`'${f.name}'을(를) 삭제할까요?\n이 음식이 포함된 식단 기록도 함께 삭제됩니다.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
