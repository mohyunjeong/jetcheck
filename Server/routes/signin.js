const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const bcrypt = require('bcrypt');

// 오라클 클라이언트 경로 설정
oracledb.initOracleClient({
  libDir: "C:/oracle/instantclient-basic-windows.x64-23.4.0.24.05/instantclient_23_4",
});

router.post('/', async (req, res) => {
  const { email, password, name, phone, joinDate, userRole } = req.body;

  try {
    // DB 연결
    let connection;
    try {
      connection = await oracledb.getConnection({
        user: 'CGI_24S_IOT3_3',
        password: 'smhrd3',
        connectString: 'project-db-cgi.smhrd.com:1524'
      });

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(password, 10);

      // 회원가입 정보 저장
      await connection.execute(
        `INSERT INTO USERS(USER_EMAIL, USER_PASSWORD, USER_NAME, PHONE_NUMBER, JOINING_DATE, USER_ROLE)
         VALUES(:email, :password, :name, :phone, TO_DATE(:joinDate, 'YYYY-MM-DD'), :userRole)`,
        {
          email,
          password: hashedPassword,
          name,
          phone,
          joinDate,
          userRole
        },
        { autoCommit: true }
      );
      res.status(200).json({ message: '회원가입 완료!' }); // 200 상태 코드와 성공 메시지 반환

    } catch (err) {
      console.error('에러:', err);
      res.status(500).json({ message: '회원가입 실패!', error: err.message });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('연결 종료 중 에러: ', err);
        }
      }
    }
  } catch (err) {
    console.error('에러:', err.message); // 에러 메시지 출력
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

module.exports = router;
