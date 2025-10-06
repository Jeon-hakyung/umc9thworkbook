import { StatusCodes } from "http-status-codes";
import { bodyToUser } from "../dtos/user.dto.js";
import { userSignUp } from "../services/user.service.js";
import { handleAddStore } from "./store.controller.js";
import {validationResult} from 'express-validator';


export const handleUserSignUp = async (req, res, next) => {
  console.log("회원가입을 요청했습니다!");
  console.log("body:", req.body); // 값이 잘 들어오나 확인하기 위한 테스트용

  // 유효성 검사 결과 확인 
  const errors=validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
  }
  

  const {password}= req.body;
  console.log("비밀번호",password);
  try {
    const user = await userSignUp(bodyToUser(req.body));
    res.status(StatusCodes.CREATED).json({ result: user });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message:'서버 오류 발생, 다시 시도해주세요'
    })
  }

 
};

export const handleUserLogin= async (req, res, next) => {
  console.log("로그인을 요청했습니다.");
  
}

