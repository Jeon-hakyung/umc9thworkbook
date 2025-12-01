import { Prisma } from "@prisma/client";
import { prisma } from "../db.config.js";

// 1. addUser 함수가 받을 데이터의 타입 정의
// (Service에서 넘겨주는 데이터와 일치해야 함)

// 2. User 데이터 삽입
export const addUser = async (data: Prisma.UserCreateInput) => {
  // 이메일 중복을 확인함
  const user = await prisma.user.findFirst({
    where: { email: data.email },
  });

  if (user) {
    // 이미 존재하는 이메일
    return null;
  }

  // 새로운 유저 생성
  const created = await prisma.user.create({ data: data });

  // 생성된 유저의 id를 반환함
  return created.id;
};

// 3. 사용자 정보 얻기
export const getUser = async (userId: number) => {
  const user = await prisma.user.findFirstOrThrow({ where: { id: userId } });
  return user;
};

// 4. 음식 선호 카테고리 매핑
export const setPreference = async (userId: number, foodCategoryId: number) => {
  await prisma.userFavorCategory.create({
    data: {
      userId: userId,
      foodCategoryId: foodCategoryId,
    },
  });
};

// 5. 사용자 선호 카테고리 반환
export const getUserPreferencesByUserId = async (userId: number) => {
  const preferences = await prisma.userFavorCategory.findMany({
    select: {
      id: true,
      userId: true,
      foodCategoryId: true,
      foodCategory: true,
    },
    where: { userId: userId },
    orderBy: { foodCategoryId: "asc" },
  });

  return preferences;
};