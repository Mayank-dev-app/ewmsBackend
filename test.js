// import * as mariadb from "mariadb";
// import { PrismaClient } from "@prisma/client";
// import { PrismaMariaDb } from "@prisma/adapter-mariadb";
// import dotenv from "dotenv";
// dotenv.config();

// const pool = mariadb.createPool({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//     port: Number(process.env.MYSQL_PORT),
//     connectionLimit: 3,
//     connectTimeout: 60000,      // ⬆️ 60 seconds
//     acquireTimeout: 60000,      // ⬆️ 60 seconds
//     waitForConnections: true,
//     allowPublicKeyRetrieval: true,
//     ssl: false,
// });

// const adapter = new PrismaMariaDb(pool);
// const prisma = new PrismaClient({ adapter });

// async function main() {
//   try {
//     // Direct pool se test karo pehle
//     const conn = await pool.getConnection();
//     console.log('✅ Pool Connection Successful!');
    
//     const rows = await conn.query("SHOW TABLES");
//     console.log('📋 Tables:', rows);
//     conn.release();

//   } catch (err) {
//     console.log('❌ Error:', err.message);
//   } finally {
//     await pool.end();
//   }
// }

// main();