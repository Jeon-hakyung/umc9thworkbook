import { pool,prisma } from "../db.config.js";

// User 데이터 삽입
export const addUser = async (data) => {

  // 이메일 중복을 확인함 
  const user = await prisma.user.findFirst({
    where: {email: data.email},
  });
  if (user) {
    // 이미 존재하는 이메일 
    return null;
  }
  
  // 새로운 유저 생성 
  const created= await prisma.user.create({ data: data});

  // 생성된 유저의 id를 반환함 
  return created.id;

};

// 사용자 정보 얻기
export const getUser = async (userId) => {

  const user= await prisma.user.findFirstOrThrow ({where: {id: userId}});
  return user;

};

// 음식 선호 카테고리 매핑
export const setPreference = async (userId, foodCategoryId) => {
  await prisma.userFavorCategory.create({
    data: {
      userId: userId,
      foodCategoryId: foodCategoryId,
    },
  });
};

// 사용자 선호 카테고리 반환
export const getUserPreferencesByUserId = async (userId) => {
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

  console.log("🔥 Prisma Raw Result:", JSON.stringify(preferences, null, 2));
  return preferences;
};
