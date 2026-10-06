export const NUTRIENTS = [
  { key: "calories", label: "열량", unit: "kcal" },
  { key: "protein", label: "단백질", unit: "g" },
  { key: "carbs", label: "탄수화물", unit: "g" },
  { key: "fat", label: "지방", unit: "g" },
  { key: "fiber", label: "식이섬유", unit: "g" },
  { key: "sodium", label: "나트륨", unit: "mg" },
] as const;

export type NutrientKey = (typeof NUTRIENTS)[number]["key"];
export type Nutrients = Record<NutrientKey, number>;

export const CATEGORIES = [
  "곡류·전분",
  "육류",
  "어패류",
  "달걀·콩류",
  "유제품",
  "채소",
  "과일",
  "견과류",
  "기타",
] as const;

export const MEAL_TYPES = [
  { key: "breakfast", label: "아침" },
  { key: "lunch", label: "점심" },
  { key: "dinner", label: "저녁" },
  { key: "snack", label: "간식" },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]["key"];

/** 음식의 영양성분은 100g 기준으로 저장한다. */
export type Food = Nutrients & {
  id: string;
  name: string;
  category: string;
  servingSize: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type MealEntry = {
  id: string;
  date: string;
  mealType: MealType;
  foodId: string;
  amount: number;
  memo: string;
  createdAt: string;
};

/** 나트륨은 '목표'가 아니라 '상한'으로 취급한다. */
export type Goals = Nutrients;

export function emptyNutrients(): Nutrients {
  return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };
}

export function scaleNutrients(food: Nutrients, grams: number): Nutrients {
  const result = emptyNutrients();
  for (const { key } of NUTRIENTS) result[key] = (food[key] * grams) / 100;
  return result;
}

export function sumNutrients(list: Nutrients[]): Nutrients {
  const total = emptyNutrients();
  for (const n of list) for (const { key } of NUTRIENTS) total[key] += n[key];
  return total;
}

/** 탄수화물·단백질·지방이 열량에서 차지하는 비율(%). */
export function macroRatio(n: Nutrients) {
  const carbs = n.carbs * 4;
  const protein = n.protein * 4;
  const fat = n.fat * 9;
  const total = carbs + protein + fat;
  if (total === 0) return { carbs: 0, protein: 0, fat: 0 };
  return {
    carbs: (carbs / total) * 100,
    protein: (protein / total) * 100,
    fat: (fat / total) * 100,
  };
}

export function fmt(n: number, digits = 1) {
  return n.toLocaleString("ko-KR", { maximumFractionDigits: digits });
}

export function todayKST() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

export function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDateKo(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  return d.toLocaleDateString("ko-KR", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function mealTypeLabel(key: string) {
  return MEAL_TYPES.find((m) => m.key === key)?.label ?? key;
}
