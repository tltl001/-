import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateMeal } from "@/app/actions";
import { MealForm } from "@/components/MealForm";
import { Card, PageHeader } from "@/components/ui";
import { getFoods, getMeal } from "@/lib/db";

export const metadata: Metadata = { title: "식단 기록 수정" };

export default async function EditMealPage(props: PageProps<"/meals/[id]/edit">) {
  const { id } = await props.params;
  const [meal, foods] = await Promise.all([getMeal(id), getFoods()]);
  if (!meal) notFound();

  return (
    <>
      <PageHeader title="식단 기록 수정" />
      <Card className="max-w-2xl">
        <MealForm
          action={updateMeal.bind(null, meal.id)}
          foods={foods}
          meal={meal}
          defaultDate={meal.date}
          submitLabel="저장하기"
          cancelHref={`/meals?date=${meal.date}`}
        />
      </Card>
    </>
  );
}
