"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as db from "@/lib/db";
import {
  CATEGORIES,
  MEAL_TYPES,
  NUTRIENTS,
  emptyNutrients,
  isValidDate,
  type MealType,
} from "@/lib/nutrition";

export type FormState = {
  errors?: Record<string, string>;
  message?: string;
  ok?: boolean;
  values?: Record<string, string>;
};

function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (!key.startsWith("$") && typeof value === "string") values[key] = value;
  }
  return values;
}

function parseNumber(
  values: Record<string, string>,
  key: string,
  errors: Record<string, string>,
  { required = true, max = 100000 } = {},
) {
  const raw = (values[key] ?? "").trim();
  if (raw === "") {
    if (required) errors[key] = "값을 입력하세요.";
    return 0;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) errors[key] = "0 이상의 숫자를 입력하세요.";
  else if (n > max) errors[key] = `${max.toLocaleString()} 이하로 입력하세요.`;
  return n;
}

function refreshAll() {
  revalidatePath("/", "layout");
}

// ── 음식 ─────────────────────────────────────────────

function parseFood(formData: FormData) {
  const values = formValues(formData);
  const errors: Record<string, string> = {};

  const name = (values.name ?? "").trim();
  if (!name) errors.name = "음식 이름을 입력하세요.";
  else if (name.length > 50) errors.name = "50자 이내로 입력하세요.";

  const category = values.category ?? "";
  if (!(CATEGORIES as readonly string[]).includes(category)) errors.category = "분류를 선택하세요.";

  const servingSize = parseNumber(values, "servingSize", errors, { max: 5000 });
  if (!errors.servingSize && servingSize <= 0) errors.servingSize = "0보다 큰 값을 입력하세요.";

  const nutrients = emptyNutrients();
  for (const { key } of NUTRIENTS) nutrients[key] = parseNumber(values, key, errors);
  if (nutrients.protein + nutrients.carbs + nutrients.fat + nutrients.fiber > 100) {
    errors.protein = "100g 기준 단백질·탄수화물·지방·식이섬유의 합은 100g을 넘을 수 없습니다.";
  }

  const note = (values.note ?? "").trim().slice(0, 300);

  if (Object.keys(errors).length > 0) return { errors, values };
  return { input: { name, category, servingSize, note, ...nutrients }, values };
}

export async function createFood(_prev: FormState, formData: FormData): Promise<FormState> {
  const { input, errors, values } = parseFood(formData);
  if (!input) return { errors, values };
  const food = await db.createFood(input);
  refreshAll();
  redirect(`/foods/${food.id}`);
}

export async function updateFood(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { input, errors, values } = parseFood(formData);
  if (!input) return { errors, values };
  const food = await db.updateFood(id, input);
  if (!food) return { message: "음식을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.", values };
  refreshAll();
  redirect(`/foods/${id}`);
}

export async function deleteFood(id: string) {
  await db.deleteFood(id);
  refreshAll();
  redirect("/foods");
}

// ── 식단 기록 ────────────────────────────────────────

async function parseMeal(formData: FormData) {
  const values = formValues(formData);
  const errors: Record<string, string> = {};

  const date = values.date ?? "";
  if (!isValidDate(date)) errors.date = "올바른 날짜를 선택하세요.";

  const mealType = values.mealType as MealType;
  if (!MEAL_TYPES.some((m) => m.key === mealType)) errors.mealType = "식사 구분을 선택하세요.";

  const foodId = values.foodId ?? "";
  if (!foodId) errors.foodId = "음식을 선택하세요.";
  else if (!(await db.foodExists(foodId))) errors.foodId = "존재하지 않는 음식입니다.";

  const amount = parseNumber(values, "amount", errors, { max: 5000 });
  if (!errors.amount && amount <= 0) errors.amount = "0보다 큰 값을 입력하세요.";

  const memo = (values.memo ?? "").trim().slice(0, 100);

  if (Object.keys(errors).length > 0) return { errors, values };
  return { input: { date, mealType, foodId, amount, memo }, values };
}

export async function createMeal(_prev: FormState, formData: FormData): Promise<FormState> {
  const { input, errors, values } = await parseMeal(formData);
  if (!input) return { errors, values };
  await db.createMeal(input);
  refreshAll();
  // 연속 입력이 편하도록 날짜·식사 구분은 유지한다.
  return {
    ok: true,
    message: "기록이 추가되었습니다.",
    values: { date: input.date, mealType: input.mealType },
  };
}

export async function updateMeal(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { input, errors, values } = await parseMeal(formData);
  if (!input) return { errors, values };
  const meal = await db.updateMeal(id, input);
  if (!meal) return { message: "기록을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.", values };
  refreshAll();
  redirect(`/meals?date=${input.date}`);
}

export async function deleteMeal(id: string) {
  await db.deleteMeal(id);
  refreshAll();
}

// ── 목표 ─────────────────────────────────────────────

export async function updateGoals(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const errors: Record<string, string> = {};
  const goals = emptyNutrients();
  for (const { key } of NUTRIENTS) {
    goals[key] = parseNumber(values, key, errors);
    if (!errors[key] && goals[key] <= 0) errors[key] = "0보다 큰 값을 입력하세요.";
  }
  if (Object.keys(errors).length > 0) return { errors, values };
  await db.updateGoals(goals);
  refreshAll();
  return { ok: true, message: "목표가 저장되었습니다.", values };
}
