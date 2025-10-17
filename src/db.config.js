import {PrismaClient} from "@prisma/client";
import mysql from "mysql2/promise";
import 'dotenv/config';

export const prisma=new PrismaClient( 
  {log: ["query", "error", "warn"]});

// ✅ 모든 쿼리에 대해 실행 시간(ms)을 측정
prisma.$on("query", (event) => {
  const start = Date.now();

  // Prisma의 'query' 이벤트는 쿼리 실행 후 바로 발생하므로,
  // 실제 실행 시간은 event.duration(ms)에 포함되어 있음
  console.log(`[SQL Query Time] ${event.duration} ms`);
  console.log(`Query: ${event.query}`);
});

export const pool = mysql.createPool({

  // TODO: 추후 Prisma로 완전 전환 후 mysql pool 제거 예정 
  host: process.env.DB_HOST ?? "127.0.0.1", // mysql의 hostname
  port: Number(process.env.DB_PORT ?? 3306), // 포트 번호
  user: process.env.DB_USER, // user 이름
  password: process.env.DB_PASSWORD, // 비밀번호
  database: process.env.DB_NAME, // 데이터베이스 이름
  waitForConnections:true,
  // Pool에 획득할 수 있는 connection이 없을 때,
  // true면 요청을 queue에 넣고 connection을 사용할 수 있게 되면 요청을 실행하며, false이면 즉시 오류를 내보내고 다시 요청
  connectionLimit:10, // 몇 개의 커넥션을 가지게끔 할 것인지
  queueLimit: 0, // getConnection에서 오류가 발생하기 전에 Pool에 대기할 요청의 개수 한도
});

export async function checkDbConnection() {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log("DB 연결 성공");
    } catch (err) {
      console.error("DB 연결 실패:", err.message);
      process.exit(1); // 연결 실패 시 서버 종료
    }
  }