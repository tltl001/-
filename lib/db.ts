import { promises as fs } from "fs";
import path from "path";
import { connection } from "next/server";
import { todayKST, type Food, type Goals, type MealEntry } from "./nutrition";

type Database = {
  foods: Food[];
  meals: MealEntry[];
  goals: Goals;
};

export type FoodInput = Omit<Food, "id" | "createdAt" | "updatedAt">;
export type MealInput = Omit<MealEntry, "id" | "createdAt">;

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// 파일 하나를 저장소로 쓰므로 쓰기 작업은 순서대로 처리한다.
let writeQueue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Database> {
  try {
    return JSON.parse(await fs.readFile(DB_PATH, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const db = seed();
    await save(db);
    return db;
  }
}

async function save(db: Database) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function mutate<T>(fn: (db: Database) => T): Promise<T> {
  const run = writeQueue.then(async () => {
    const db = await load();
    const result = fn(db);
    await save(db);
    return result;
  });
  writeQueue = run.catch(() => {});
  return run;
}

async function read() {
  await connection();
  await writeQueue;
  return load();
}

// ── 음식 ─────────────────────────────────────────────

export async function getFoods() {
  const db = await read();
  return [...db.foods].sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export async function getFood(id: string) {
  const db = await read();
  return db.foods.find((f) => f.id === id);
}

export async function countMealsForFood(id: string) {
  const db = await read();
  return db.meals.filter((m) => m.foodId === id).length;
}

export function createFood(input: FoodInput) {
  return mutate((db) => {
    const now = new Date().toISOString();
    const food: Food = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    db.foods.push(food);
    return food;
  });
}

export function updateFood(id: string, input: FoodInput) {
  return mutate((db) => {
    const index = db.foods.findIndex((f) => f.id === id);
    if (index === -1) return undefined;
    db.foods[index] = { ...db.foods[index], ...input, updatedAt: new Date().toISOString() };
    return db.foods[index];
  });
}

/** 음식을 삭제하면 그 음식을 사용한 식단 기록도 함께 삭제한다. */
export function deleteFood(id: string) {
  return mutate((db) => {
    db.foods = db.foods.filter((f) => f.id !== id);
    db.meals = db.meals.filter((m) => m.foodId !== id);
  });
}

// ── 식단 기록 ────────────────────────────────────────

export async function getMealsByDate(date: string) {
  const db = await read();
  return db.meals
    .filter((m) => m.date === date)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .flatMap((meal) => {
      const food = db.foods.find((f) => f.id === meal.foodId);
      return food ? [{ ...meal, food }] : [];
    });
}

export async function getMeal(id: string) {
  const db = await read();
  return db.meals.find((m) => m.id === id);
}

export async function getStats() {
  const db = await read();
  return {
    foodCount: db.foods.length,
    mealCount: db.meals.length,
    loggedDays: new Set(db.meals.map((m) => m.date)).size,
  };
}

export function createMeal(input: MealInput) {
  return mutate((db) => {
    const meal: MealEntry = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    db.meals.push(meal);
    return meal;
  });
}

export function updateMeal(id: string, input: MealInput) {
  return mutate((db) => {
    const index = db.meals.findIndex((m) => m.id === id);
    if (index === -1) return undefined;
    db.meals[index] = { ...db.meals[index], ...input };
    return db.meals[index];
  });
}

export function deleteMeal(id: string) {
  return mutate((db) => {
    db.meals = db.meals.filter((m) => m.id !== id);
  });
}

export async function foodExists(id: string) {
  await writeQueue;
  const db = await load();
  return db.foods.some((f) => f.id === id);
}

// ── 목표 ─────────────────────────────────────────────

export async function getGoals() {
  const db = await read();
  return db.goals;
}

export function updateGoals(goals: Goals) {
  return mutate((db) => {
    db.goals = goals;
  });
}

// ── 초기 데이터 ──────────────────────────────────────

function seed(): Database {
  const now = new Date().toISOString();
  // [이름, 분류, 1회 제공량(g), 열량, 단백질, 탄수화물, 지방, 식이섬유, 나트륨] — 100g 기준 대략값
  const rows: [string, string, number, number, number, number, number, number, number][] = [
    ["백미밥", "곡류·전분", 210, 143, 2.5, 31.7, 0.3, 0.3, 2],
    ["현미밥", "곡류·전분", 210, 150, 3.0, 32.0, 1.0, 1.8, 3],
    ["고구마(찐 것)", "곡류·전분", 150, 128, 1.5, 30.3, 0.2, 3.0, 9],
    ["오트밀", "곡류·전분", 40, 379, 13.2, 67.7, 6.5, 10.1, 6],
    ["닭가슴살(삶은 것)", "육류", 100, 165, 31.0, 0, 3.6, 0, 74],
    ["연어", "어패류", 100, 208, 20.0, 0, 13.0, 0, 59],
    ["달걀(삶은 것)", "달걀·콩류", 50, 155, 12.6, 1.1, 10.6, 0, 124],
    ["두부", "달걀·콩류", 100, 84, 9.3, 1.9, 4.6, 0.5, 7],
    ["우유", "유제품", 200, 61, 3.2, 4.8, 3.3, 0, 43],
    ["그릭요거트(플레인)", "유제품", 100, 97, 9.0, 3.6, 5.0, 0, 35],
    ["브로콜리", "채소", 80, 34, 2.8, 6.6, 0.4, 2.6, 33],
    ["배추김치", "채소", 40, 18, 1.1, 2.4, 0.5, 1.6, 650],
    ["바나나", "과일", 120, 89, 1.1, 22.8, 0.3, 2.6, 1],
    ["사과", "과일", 200, 52, 0.3, 13.8, 0.2, 2.4, 1],
    ["아몬드", "견과류", 25, 579, 21.2, 21.6, 49.9, 12.5, 1],
  ];
  const foods: Food[] = rows.map(
    ([name, category, servingSize, calories, protein, carbs, fat, fiber, sodium]) => ({
      id: crypto.randomUUID(),
      name,
      category,
      servingSize,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
      note: "",
      createdAt: now,
      updatedAt: now,
    }),
  );

  const byName = (name: string) => foods.find((f) => f.name === name)!.id;
  const today = todayKST();
  const sample: [MealEntry["mealType"], string, number][] = [
    ["breakfast", "오트밀", 40],
    ["breakfast", "우유", 200],
    ["breakfast", "바나나", 120],
    ["lunch", "현미밥", 210],
    ["lunch", "닭가슴살(삶은 것)", 120],
    ["lunch", "배추김치", 40],
  ];
  const meals: MealEntry[] = sample.map(([mealType, name, amount]) => ({
    id: crypto.randomUUID(),
    date: today,
    mealType,
    foodId: byName(name),
    amount,
    memo: "",
    createdAt: now,
  }));

  return {
    foods,
    meals,
    goals: { calories: 2000, protein: 65, carbs: 300, fat: 55, fiber: 25, sodium: 2000 },
  };
}
