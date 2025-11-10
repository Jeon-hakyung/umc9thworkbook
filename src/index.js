import fs from "fs";
import dotenv from "dotenv";
import express from "express";       // -> ES Module
import cors from "cors";
import { checkDbConnection,pool } from './db.config.js';
import { handleUserSignUp } from "./controllers/user.controller.js";
import { handleAddStore,handleListStoreReviews } from "./controllers/store.controller.js";
import {body} from 'express-validator';
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import swaggerAutogen from "swagger-autogen";
import swaggerUiExpress from "swagger-ui-express";



dotenv.config();

console.log("✅ index.js 실행됨");
console.log("✅ PORT:", process.env.PORT);

const app = express();
const port = process.env.PORT;


app.use((req,res,next)=> {
  res.success = (success)=> {
    return res.json({resultType: "SUCCESSS", error:null, success});
  };

  res.error= ({errorCode= "unknown", reason=null, data=null}) => {
    return res.json({
      resultType: "FAIL",
      error: {errorCode, reason, data},
      success: null,
    });
  };

  next();

});


app.use(cors({
  //1. origin을 * 대신 정확한 주소 사용 
  origin: ["http://127.0.0.1:5500", "http://localhost:3000"], 

  // 2. 쿠키를 허용하는 credentials 옵션 켜기
  credentials: true, 
}));                            // cors 방식 허용
app.use(express.static('public'));          // 정적 파일 접근
app.use(express.json());                    // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석
app.use(morgan('dev'));
app.use(cookieParser()); // 미들웨어로 등록 

// 스웨거 설정하기 
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
  const routes = ["./src/index.js"];
  const doc = {
    info: {
      title: "UMC 9th",
      description: "UMC 9th Node.js 테스트 프로젝트입니다.",
    },
    host: "localhost:3000",

    // ▼▼▼ 'components' 섹션 추가 ▼▼▼
  components: {
    schemas: {
      // "표준 실패 응답"을 공통 부품(StandardError)으로 정의
      StandardError: { 
        type: "object",
        properties: {
          resultType: { type: "string", example: "FAIL" },
          error: {
            type: "object",
            properties: {
              errorCode: { type: "string", example: "E400" }, // 400번대 에러
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


app.get('/', (req, res) => {
  res.send(`
  <h1>메인 페이지</h1>
  <p>이 페이지는 로그인이 필요 없습니다.</p>
  <ul>
      <li><a href="/mypage">마이페이지 (로그인 필요)</a></li>
  </ul>`);
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

app.get('/setcookie', (req,res)=> {
  // 'myCookie' 라는 이름으로 'hello' 값을 가진 쿠키를 생성
  res.cookie('myCookie', 'hello', {maxAge: 60000}); // 60초간 유효
  res.send('쿠키가 생성되었습니다!');
});

app.get('/getcookie', (req,res)=> {
  // cookie-parser 덕분에 req.cookies 객체에서 바로 꺼내 쓸 수 있음
  const myCookie= req.cookies.myCookie;

  if (myCookie) {
    console.log(req.cookies); // {myCookie: 'hello'}
    res.send(`나의 쿠키: ${myCookie}`);
  } else {
    res.send('쿠키가 없습니다.');
  }

});

app.get('/api/test', (req,res)=> {
  res.json({message: '이 응답은 보이면 안 됩니다!'});
})

const isLogin= (req,res,next) => {
    // cookie-parser가 만들어준 req.cookies 객체에서 username을 확인
    const { username } = req.cookies; 

    if (username) {
        // 1. 쿠키가 있다 = 로그인한 사용자다!
        // 다음(next) 단계 (즉, 실제 라우트 핸들러)로 보냅니다.
        console.log(`[인증 성공] ${username}님, 환영합니다.`);
        next(); 
    } else {
        // 2. 쿠키가 없다 = 로그인하지 않았다!
        // next()를 호출하지 않고, 여기서 요청을 끝내버립니다.
        console.log('[인증 실패] 로그인이 필요합니다.');
        res.status(401).send('<script>alert("로그인이 필요합니다!");location.href="/login";</script>');
    }
};


// 3-2. 로그인 페이지 (리다이렉트될 곳)
app.get('/login', (req, res) => {
  res.send('<h1>로그인 페이지</h1><p>로그인이 필요한 페이지에서 튕겨나오면 여기로 옵니다.</p>');
});

// 3-3. ★★★ 보호된 페이지 (isLogin 미들웨어 적용) ★★★
app.get('/mypage', isLogin, (req, res) => {
  // isLogin 미들웨어를 통과해야만 이 코드가 실행됩니다.
  res.send(`
      <h1>마이페이지</h1>
      <p>환영합니다, ${req.cookies.username}님!</p>
      <p>이 페이지는 로그인한 사람만 볼 수 있습니다.</p>
  `);
});



// --- 4. 테스트 편의를 위한 헬퍼(Helper) 라우트 ---

// 4-1. 임시로 '로그인 쿠키'를 생성하는 헬퍼
app.get('/set-login', (req, res) => {
  // 1시간 유효한 'username' 쿠키를 "UMC_User"라는 이름으로 생성
  res.cookie('username', 'UMC9th', { maxAge: 3600000 });
  res.send('로그인 쿠키(username=UMC9th) 생성 완료! <a href="/mypage">마이페이지로 이동</a>');
});

// 4-2. 쿠키를 삭제하는 헬퍼 (로그아웃)
app.get('/set-logout', (req, res) => {
  res.clearCookie('username');
  res.send('로그아웃 완료 (쿠키 삭제). <a href="/">메인으로</a>');
});

/**
 * 전역 오류를 처리하기 위한 미들웨어
 */
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).error({
    errorCode: err.errorCode || "unknown",
    reason: err.reason || err.message || null,
    data: err.data || null,
  });
});

checkDbConnection().then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  });