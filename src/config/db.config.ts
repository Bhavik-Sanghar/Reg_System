import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "System_design_task",
  password: "Bhavik@2272",
});

export default pool;
