// import "dotenv/config";
// import { PrismaClient } from "@prisma/client";
// import { PrismaMariaDb } from "@prisma/adapter-mariadb";
// import * as mariadb from "mariadb";

// const pool = mariadb.createPool({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//     port: Number(process.env.MYSQL_PORT) || 45831,
//     connectionLimit: 3,
//     connectTimeout: 60000,
//     acquireTimeout: 60000,
//     waitForConnections: true,
// });

// // ✅ Connection Check
// pool.getConnection()
//     .then(conn => {
//         console.log(" Database Connected!");
//         console.log(` Host: ${process.env.MYSQL_HOST}`);
//         console.log(`Port:  ${process.env.MYSQL_PORT}`);
//         console.log("DATABASE_URL:", process.env.DATABASE_URL);
//         conn.release();
//     })
//     .catch(err => {
//         console.log("❌ Database Failed:", err.message);
//     });

// const adapter = new PrismaMariaDb(pool);

// const prisma = new PrismaClient({ 
//     adapter,
//     log: ['error'],
// });

// export default prisma;

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Connection Check
prisma.$connect()
    .then(() => {
        console.log("✅ Database Connected Successfully!");
        console.log(`✅ Host: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]}`);
    })
    .catch((err) => {
        console.log("❌ Database Connection Failed!");
        console.log("❌ Error:", err.message);
    });

export default prisma;