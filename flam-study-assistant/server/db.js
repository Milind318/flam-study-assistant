import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();


export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "flam_study_assistant",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function verifyDbConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("[db] MySQL connection OK");
    return true;
  } catch (err) {
    console.warn("[db] Could not connect to MySQL:", err.message);
    console.warn("[db] Session save/load will not work until this is fixed.");
    return false;
  }
}
