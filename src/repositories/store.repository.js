import { pool } from "../db.config.js";

// 가게 데이터 삽입하기
export const addStores= async (data) => {
    const conn = await pool.getConnection();

    try {
        const [result] = await pool.query(
            `INSERT INTO store (name, address, score, region_id) 
            VALUES (?, ?, ?, ?);`,
            [
              data.name,
              data.address,
              data.score,
              data.regionId
            ]
          );
      
      
          return result.insertId;
    } catch(err) {
        throw new Error('가게 추가 중 오류 발생: ${err.message}');
    } finally {
        conn.release();
    }
}