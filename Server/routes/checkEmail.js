const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// 오라클 클라이언트 경로 설정
oracledb.initOracleClient({
  libDir: "C:/oracle/instantclient-basic-windows.x64-23.4.0.24.05/instantclient_23_4",
});

router.use(express.json()); // JSON 요청을 파싱하기 위해 필요

// 이메일 중복 검사
router.post('/', async (req, res) => {
  const { email } = req.body;
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

      // 이메일 중복 검사
      const result = await connection.execute(
        `SELECT USER_EMAIL FROM USERS WHERE USER_EMAIL = :email`,
        { email }
      );
      
      // 이메일이 중복되었다면 true, 중복되지 않았아면 false를 반환
      if (result.rows.length > 0) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
      
    } catch (err) {
      console.error('에러:', err);
      res.status(500).send('Database error');
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

module.exports = router;
