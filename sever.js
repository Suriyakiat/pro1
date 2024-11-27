const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const port = 3000;

// กำหนดการเชื่อมต่อกับ MSSQL
const dbConfig = {
    user: 'ipuetdatabase',    // ชื่อผู้ใช้ของฐานข้อมูล
    password: 'Audi2546', // รหัสผ่านของฐานข้อมูล
    server: 'ipuetdatabase.database.windows.net',      // เซิร์ฟเวอร์ที่ฐานข้อมูลอยู่
    database: 'ipuetdatabase',// ชื่อฐานข้อมูล
    options: {
        encrypt: true, // สำหรับ Azure
        trustServerCertificate: true // ใช้ได้กับการพัฒนาในเครื่อง
    }
};

// ใช้ bodyParser เพื่อรับข้อมูลจากฟอร์ม
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ตั้งค่าให้รับข้อมูลจากฟอร์ม POST
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน!' });
    }

    try {
        // เชื่อมต่อกับฐานข้อมูล
        await sql.connect(dbConfig);

        // ตรวจสอบว่าผู้ใช้มีอีเมลนี้อยู่ในฐานข้อมูลแล้วหรือไม่
        const result = await sql.query(`SELECT * FROM Users WHERE email = @email`, {
            email: email
        });

        if (result.recordset.length > 0) {
            return res.status(400).json({ message: 'อีเมลนี้ถูกใช้ลงทะเบียนแล้ว!' });
        }

        // เพิ่มผู้ใช้ใหม่ลงในฐานข้อมูล
        await sql.query(`INSERT INTO Users (email, password) VALUES (@email, @password)`, {
            email: email,
            password: password
        });

        res.status(200).json({ message: 'ลงทะเบียนสำเร็จ!' });
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
