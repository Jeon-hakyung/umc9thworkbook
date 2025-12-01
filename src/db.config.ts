import { PrismaClient } from "@prisma/client";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 1. Prisma Client 설정
// $on('query')를 사용하려면 log 설정에서 emit을 'event'로 지정해야 합니다.
export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" }, // 이벤트를 emit 하도록 설정
    { emit: "stdout", level: "error" }, // 에러는 콘솔에 바로 출력
    { emit: "stdout", level: "warn" },  // 경고도 콘솔에 바로 출력
  ],
});

// 2. 쿼리 로깅 (타입 추론이 자동으로 됩니다)
prisma.$on("query", (e) => {
  console.log(`[SQL Query Time] ${e.duration} ms`);
  console.log(`Query: ${e.query}`);
});

// 3. MySQL2 Pool 설정 (Legacy)
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 4. DB 연결 확인 함수
export const checkDbConnection = async () => {
  try {
    const conn = await pool.getConnection();
    // 성공 시 로그 출력
    console.log("✅ DB 연결 성공");
    conn.release();
  } catch (err) {
    // TypeScript에서 catch의 err는 'unknown' 타입입니다.
    // Error 객체인지 확인 후 메시지를 출력합니다.
    if (err instanceof Error) {
      console.error("❌ DB 연결 실패:", err.message);
    } else {
      console.error("❌ DB 연결 실패: 알 수 없는 오류");
    }
    process.exit(1); // 연결 실패 시 서버 종료
  }
};