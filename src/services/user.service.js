import { join } from "path";
import { responseFromUser } from "../dtos/user.dto.js";
import {
  addUser,
  getUser,
  getUserPreferencesByUserId,
  setPreference,
} from "../repositories/user.repository.js";
import bcrypt from 'bcrypt';
import { DuplicateUserEmailError } from "../errors.js";

export const userSignUp = async (data) => {
  
  const {password} = data;
  const saltRounds=10; 
  const hashedPassword= await bcrypt.hash(password,saltRounds);

  const joinUserId = await addUser({ // DB에 저장하는 로직은 여기 있음 
    email: data.email,
    name: data.name,
    password: hashedPassword,
    gender: data.gender,
    birth: data.birth,
    address: data.address,
    detailAddress: data.detailAddress,
    phoneNumber: data.phoneNumber,
  });

  if (joinUserId === null) {
    throw new DuplicateUserEmailError("이미 존재하는 이메일입니다.",data);
  }

  for (const preference of data.preferences) {
    await setPreference(joinUserId, preference);
  }


  const user = await getUser(joinUserId);
  const preferences = await getUserPreferencesByUserId(joinUserId);

  return responseFromUser({ user, preferences });
};