import { responseFromUser } from "../dtos/user.dto.js";
import {
  addUser,
  getUser,
  getUserPreferencesByUserId,
  setPreference,
} from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import { DuplicateUserEmailError } from "../errors.js";

// userSignUp 함수가 받을 데이터의 타입을 정의합니다.
// (DTO에서 변환된 데이터 구조와 일치해야 합니다)
export const userSignUp = async (data: {
  email: string;
  name: string;
  password: string;
  gender: string;
  birth: Date; // DTO에서 Date 객체로 변환되었으므로 Date 타입
  address: string;
  detailAddress: string;
  phoneNumber: string;
  preferences: number[];
}) => {
  const { password } = data;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const joinUserId = await addUser({
    // DB에 저장하는 로직은 repository에 위임
    email: data.email,
    name: data.name,
    password: hashedPassword, // 암호화된 비밀번호 전달
    gender: data.gender,
    birth: data.birth,
    address: data.address,
    detailAddress: data.detailAddress,
    phoneNumber: data.phoneNumber,
  });

  if (joinUserId === null) {
    throw new DuplicateUserEmailError("이미 존재하는 이메일입니다.", data);
  }

  // 선호 카테고리 저장
  for (const preference of data.preferences) {
    await setPreference(joinUserId, preference);
  }

  const user = await getUser(joinUserId);
  const preferences = await getUserPreferencesByUserId(joinUserId);

  return responseFromUser({ user, preferences });
};