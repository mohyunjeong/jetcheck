const express = require('express');
const oracledb = require('oracledb');
const router = express.Router();

// 오라클 클라이언트 경로 설정
oracledb.initOracleClient({
  libDir: "C:/oracle/instantclient-basic-windows.x64-23.4.0.24.05/instantclient_23_4",
});

// 오라클 데이터베이스 연결 설정
const dbConfig = {
  user: 'CGI_24S_IOT3_3',
  password: 'smhrd3',
  connectString: 'project-db-cgi.smhrd.com:1524'
};

router.post('/', async (req, res) => {
  const { user_email, workplace_idx, att_type } = req.body;
  console.log(req.body);
  let connection;


  try {
    // 데이터베이스 연결
    connection = await oracledb.getConnection(dbConfig);

    // 데이터베이스에 출근 시간 저장
    await connection.execute(
      `INSERT INTO ATTENDANCES (USER_EMAIL, ATT_TYPE, CHECK_TIME, WORKPLACE_IDX)
       VALUES (:user_email, :att_type, CURRENT_TIMESTAMP, :workplace_idx)`,
      { 
        user_email: user_email, 
        workplace_idx: workplace_idx,
        att_type: att_type
      },
      { autoCommit: true }
    );

    if(att_type == 'IN'){
    // JSON 형식으로 응답 보내기
    res.status(200).json({
      status: 'success',
      message: `출근 완료: ${user_email}`
    });
    } else{
    // JSON 형식으로 응답 보내기
    res.status(200).json({
      status: 'success',
      message: `퇴근 완료: ${user_email}`
    });
    }
    
  } catch (err) {
    console.error('데이터베이스 오류:', err);
    // JSON 형식으로 에러 응답 보내기
    res.status(500).json({
      status: 'error',
      message: '출퇴근시간 기록 오류',
      error: err.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('연결 종료 오류:', err);
      }
    }
  }
});

module.exports = router;
