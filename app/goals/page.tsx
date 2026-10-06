import type { Metadata } from "next";
import { GoalsForm } from "@/components/GoalsForm";
import { Card, PageHeader } from "@/components/ui";
import { getGoals } from "@/lib/db";

export const metadata: Metadata = { title: "목표 설정" };

export default async function GoalsPage() {
  const goals = await getGoals();
  return (
    <>
      <PageHeader
        title="하루 영양 목표"
        description="대시보드와 식단 기록의 진행률 계산에 사용됩니다."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <GoalsForm goals={goals} />
        </Card>
        <Card className="text-sm text-stone-600">
          <h2 className="mb-2 font-semibold text-stone-900">참고: 성인 일반 기준</h2>
          <ul className="list-disc space-y-1 pl-4">
            <li>열량은 성별·나이·활동량에 따라 1,600~2,600kcal 범위에서 개인차가 큽니다.</li>
            <li>탄수화물 55~65%, 단백질 7~20%, 지방 15~30%의 열량 비율이 권장됩니다.</li>
            <li>식이섬유는 하루 25~30g 정도가 권장됩니다.</li>
            <li>나트륨은 하루 2,000mg 이하로 섭취하는 것이 좋습니다.</li>
          </ul>
          <p className="mt-3 text-xs text-stone-400">2020 한국인 영양소 섭취기준을 바탕으로 한 대략적 안내입니다.</p>
        </Card>
      </div>
    </>
  );
}
