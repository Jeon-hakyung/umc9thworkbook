import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerAutogen from "swagger-autogen";
import swaggerUiExpress from "swagger-ui-express";
import passport from "passport";
import { googleStrategy, jwtStrategy } from "./auth.config.js";
import { checkDbConnection } from "./db.config.js";
import { handleUserSignUp } from "./controllers/user.controller.js";
import { handleAddStore, handleListStoreReviews } from "./controllers/store.controller.js";
import { body } from "express-validator";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

// ------------------------------------
// 1. 공통 미들웨어 설정
// ------------------------------------

// 커스텀 응답 함수 등록 (res.success, res.error)
// (주의: @types/express.d.ts 파일이 있어야 에러가 안 납니다!)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.success = (success) => {
    return res.json({ resultType: "SUCCESS", error: null, success });
  };

  res.error = ({ errorCode = "unknown", reason = null, data = null }) => {
    return res.json({
      resultType: "FAIL",
      error: { errorCode, reason, data },
      success: null,
    });
  };
  next();
});

// CORS 설정
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:3000"],
  credentials: true, // 쿠키 및 Authorization 헤더 허용
}));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cookieParser());

// Passport 초기화 (세션 사용 X -> JWT 방식)
app.use(passport.initialize());
passport.use(googleStrategy);
passport.use(jwtStrategy);

// ------------------------------------
// 2. Swagger 설정
// ------------------------------------
app.use(
  "/docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup({}, {
    swaggerOptions: {
      url: "/openapi.json",
    },
  })
);

app.get("/openapi.json", async (req, res, next) => {
  // #swagger.ignore = true
  const options = {
    openapi: "3.0.0",
    disableLogs: true,
    writeOutputFile: false,
  };
  const outputFile = "/dev/null"; // 파일 출력은 사용하지 않습니다.
  const routes = ["./src/index.ts"]; // ★ .js -> .ts 로 변경
  const doc = {
    info: {
      title: "UMC 9th",
      description: "UMC 9th Node.js 테스트 프로젝트입니다.",
    },
    host: "localhost:3000",
    components: {
      schemas: {
        StandardError: { 
          type: "object",
          properties: {
            resultType: { type: "string", example: "FAIL" },
            error: {
              type: "object",
              properties: {
                errorCode: { type: "string", example: "E400" }, 
                reason: { type: "string" }
              }
            },
            success: { type: "object", nullable: true, example: null }
          }
        }
      }
    }
  };

  const result = await swaggerAutogen(options)(outputFile, routes, doc);
  res.json(result ? result.data : null);
});

// ------------------------------------
// 3. 라우트 설정
// ------------------------------------

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// [Google 로그인]
app.get("/oauth2/login/google", passport.authenticate("google", { session: false }));

app.get(
  "/oauth2/callback/google",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login-failed",
  }),
  (req, res) => {
    // googleStrategy에서 반환한 { accessToken, refreshToken }
    const tokens = req.user; 
    res.json({
      resultType: "SUCCESS",
      error: null,
      success: {
          message: "Google 로그인 성공!",
          tokens: tokens
      }
    });
  }
);

// [회원가입]
app.post(
  "/api/v1/users/signup",
  [
    body('email').notEmpty().isEmail().withMessage('유효한 이메일 형식이 아닙니다'),
    body('password').notEmpty().isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
  ],
  handleUserSignUp
);

// [가게 & 리뷰]
app.post("/api/v1/stores", handleAddStore);
app.get("/api/v1/stores/:storeId/reviews", handleListStoreReviews);

// [마이페이지 (JWT 보호)]
// isLogin 미들웨어 정의
const isLogin = passport.authenticate("jwt", { session: false });

app.get("/mypage", isLogin, (req, res) => {
  // isLogin 통과 시 req.user에 유저 정보 있음
  res.success({
    message: "인증 성공! 마이페이지입니다.",
    user: req.user
  });
});

// ------------------------------------
// 4. 전역 에러 핸들러 (가장 마지막에 위치)
// ------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).error({
    errorCode: err.errorCode || "unknown",
    reason: err.reason || err.message || null,
    data: err.data || null,
  });
});

// ------------------------------------
// 5. 서버 실행
// ------------------------------------
checkDbConnection().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });
});