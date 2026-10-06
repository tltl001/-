import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateFood } from "@/app/actions";
import { FoodForm } from "@/components/FoodForm";
import { Card, PageHeader } from "@/components/ui";
import { getFood } from "@/lib/db";

export const metadata: Metadata = { title: "음식 수정" };

export default async function EditFoodPage(props: PageProps<"/foods/[id]/edit">) {
  const { id } = await props.params;
  const food = await getFood(id);
  if (!food) notFound();

  return (
    <>
      <PageHeader title={`${food.name} 수정`} description="영양성분은 100g 기준으로 입력하세요." />
      <Card>
        <FoodForm
          action={updateFood.bind(null, food.id)}
          food={food}
          submitLabel="저장하기"
          cancelHref={`/foods/${food.id}`}
        />
      </Card>
    </>
  );
}
