const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const oracledb = require('oracledb');

// JWT 비밀번호
const JWT_SECRET = 'qwer1234'; 

oracledb.initOracleClient({
  libDir: "C:/oracle/instantclient-basic-windows.x64-23.4.0.24.05/instantclient_23_4",
});

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  async function connectToDB() {
    let connection;

    // DB 연결
    try {
      connection = await oracledb.getConnection({
        user: 'CGI_24S_IOT3_3',
        password: 'smhrd3',
        connectString: 'project-db-cgi.smhrd.com:1524'
      });

      const result = await connection.execute(
        `SELECT USER_PASSWORD, USER_ROLE, USER_NAME, PHONE_NUMBER, JOINING_DATE
         FROM USERS WHERE USER_EMAIL = :email`,
        { email }
      );

      if (result.rows.length === 0) {
        res.status(400).send("일치하는 아이디가 없습니다");
        return;
      }

      const [storedHash, userRole, userName, phoneNumber, joinDate] = result.rows[0];

      const isMatch = await bcrypt.compare(password, storedHash);

      if (isMatch) {
        // JWT 생성
        const token = jwt.sign(
          {
            email,
            userRole,
            userName,
            phoneNumber,
            joinDate,
            password
          },
          JWT_SECRET,
          { expiresIn: '30d' } // 토큰 만료 시간 설정
        );
        res.status(200).json({ success: true, token });
      } else {
        res.status(400).json({ success: false, message: "비밀번호가 틀립니다" });
      }


    } catch (err) {
      console.error('에러:', err);
      res.status(500).json({ success: false, message: 'Database error' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('에러: ', err);
        }
      }
    }
  }

  connectToDB();

});


// 로그인 유지를 위한 토큰 유효성 검사
router.post('/token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer token'에서 토큰 추출
  console.log('토큰:', token);
  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    res.status(200).json({ message: '토큰 유효성 확인 성공', decoded });
  });
});

module.exports = router;
