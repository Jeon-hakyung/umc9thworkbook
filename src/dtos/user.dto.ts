import { FoodCategory, User, UserFavorCategory } from "@prisma/client";

export type UserBody = {
  email: string;
  name: string;
  password: string;
  gender: string;
  birth: string;       // 들어올 땐 문자열 (ex: "2000-01-01")
  address?: string;    // ?는 선택적(Optional) 필드라는 뜻
  detailAddress?: string;
  phoneNumber: string;
  preferences: number[]; // 카테고리 ID 배열
};

export const bodyToUser = (body: UserBody) => {
    const birth = new Date(body.birth);
  
    return {
      email: body.email,
      name: body.name,
      password: body.password,
      gender: body.gender,
      birth,
      address: body.address || "",
      detailAddress: body.detailAddress || "",
      phoneNumber: body.phoneNumber,
      preferences: body.preferences,
    };
  };

export const responseFromUser = ({
    user,
    preferences,
  }: {
    user: User;
    preferences: (UserFavorCategory & { foodCategory: FoodCategory })[];
  }) => {
    const preferFoods = preferences.map(
      (preference) => preference.foodCategory.name
    );
  
    return {
      email: user.email,
      name: user.name,
      preferCategory: preferFoods,
    };
  };