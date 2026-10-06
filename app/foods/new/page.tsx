import type { Metadata } from "next";
import { createFood } from "@/app/actions";
import { FoodForm } from "@/components/FoodForm";
import { Card, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "음식 추가" };

export default function NewFoodPage() {
  return (
    <>
      <PageHeader title="음식 추가" description="영양성분표의 100g 기준 값을 입력하세요." />
      <Card>
        <FoodForm action={createFood} submitLabel="추가하기" cancelHref="/foods" />
      </Card>
    </>
  );
}
