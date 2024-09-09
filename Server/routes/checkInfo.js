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

// 시간 변환 함수 (KST 시간으로 변환)
const formatTime = (isoDateString) => {
  const date = new Date(isoDateString);

  // 한국 표준시 (KST)로 변환하여 'HH:MM' 형식으로 반환
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // 24시간 형식
  });
};

router.post('/', async (req, res) => {
  const { user_email, check_time, user_role } = req.body;
  let connection;
  console.log(req.body);

  try {
    // 데이터베이스 연결
    connection = await oracledb.getConnection(dbConfig);

    // 데이터베이스에서 출퇴근시간 조회
    let result;
    if (user_role === 'U') {
      result = await connection.execute(
        `SELECT U.USER_NAME, A.ATT_TYPE, A.CHECK_TIME 
         FROM ATTENDANCES A
         JOIN USERS U ON A.USER_EMAIL = U.USER_EMAIL
         WHERE A.USER_EMAIL = :user_email AND TRUNC(A.CHECK_TIME) = TO_DATE(:check_time, 'YYYY-MM-DD')`,
        { 
          user_email: user_email, 
          check_time: check_time
        }
      );
    } else {
      result = await connection.execute(
        `SELECT U.USER_NAME, A.ATT_TYPE, A.CHECK_TIME
         FROM ATTENDANCES A
         JOIN USERS U ON A.USER_EMAIL = U.USER_EMAIL
         WHERE TRUNC(A.CHECK_TIME) = TO_DATE(:check_time, 'YYYY-MM-DD')`,
        { 
          check_time: check_time 
        }
      );
    }

    // 결과 데이터 변환
    const formattedData = result.rows.map(row => ({
      userName: row[0], // USER_NAME
      attType: row[1], // ATT_TYPE
      checkTime: formatTime(row[2]) // CHECK_TIME
    }));
    
    // 데이터를 처리하여 각 사용자별 IN과 OUT 시간 저장
    const userTimes = formattedData.reduce((acc, item) => {
      const { userName, attType, checkTime } = item;

      // 사용자 이름이 없는 경우 객체를 초기화
      if (!acc[userName]) {
        acc[userName] = { IN: null, OUT: null };
      }

      // IN 또는 OUT 시간 저장
      if (attType.trim() === 'IN') {
        acc[userName].IN = checkTime;
      } else if (attType.trim() === 'OUT') {
        acc[userName].OUT = checkTime;
      }

      return acc;
    }, {});

    // 결과를 원하는 형식으로 변환
    const formattedResult = Object.keys(userTimes).map(userName => ({
      userName,
      INTime: userTimes[userName].IN,
      OUTTime: userTimes[userName].OUT
    }));

    console.log(formattedResult);

    // 조회 결과 JSON 형식으로 응답
    res.status(200).json({
      status: 'success',
      data: formattedResult // 포맷된 데이터 (배열 형식)
    });
  } catch (err) {
    console.error('데이터베이스 오류:', err);
    // JSON 형식으로 에러 응답 보내기
    res.status(500).json({
      status: 'error',
      message: '출퇴근시간 조회 오류',
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
