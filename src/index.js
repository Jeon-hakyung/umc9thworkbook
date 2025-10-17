import fs from "fs";
import dotenv from "dotenv";
import express from "express";       // -> ES Module
import cors from "cors";
import { checkDbConnection,pool } from './db.config.js';
import { handleUserSignUp } from "./controllers/user.controller.js";
import { handleAddStore,handleListStoreReviews } from "./controllers/store.controller.js";
import {body} from 'express-validator';
import morgan from "morgan";



dotenv.config();
console.log("✅ index.js 실행됨");
console.log("✅ PORT:", process.env.PORT);

const app = express();
const port = process.env.PORT;

app.use(cors());                            // cors 방식 허용
app.use(express.static('public'));          // 정적 파일 접근
app.use(express.json());                    // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post(
  "/api/v1/users/signup",
  [
    body('email')
      .notEmpty().withMessage('이메일은 필수 입력 항목입니다')
      .isEmail().withMessage('유효한 이메일 형식이 아닙니다'),
    body('password')
      .notEmpty().withMessage('비밀번호는 필수 입력 항목입니다')
      .isLength({min:8}).withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
  ], // ✅ 배열 뒤에 콤마(,) 추가
  handleUserSignUp // ✅ 별도의 인자로 분리
);
// 가게 추가하는 api 
app.post("/api/v1/stores", handleAddStore);
// 리뷰 조회하는 api
app.get("/api/v1/stores/:storeId/reviews", handleListStoreReviews);


// 테스트용 API
app.get("/test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT SLEEP(0.1)"); 
    // 쿼리 실행 (0.1초 지연 -> 부하 테스트 체감 가능)
    res.json({ message: "ok", result: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


checkDbConnection().then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  });