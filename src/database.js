import mysql from "mysql2/promise";
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export async function checkDbConnection() {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log("✅ DB 연결 성공");
    } catch (err) {
      console.error("❌ DB 연결 실패:", err.message);
      process.exit(1); // 연결 실패 시 서버 종료
    }
  }