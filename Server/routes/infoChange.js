const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const authenticateToken = require('../middleware/authenticateToken'); // 미들웨어 임포트
const bcrypt = require('bcrypt'); // 비밀번호 해시화 필요시 사용

// 오라클 클라이언트 경로 설정
oracledb.initOracleClient({
  libDir: "C:/oracle/instantclient-basic-windows.x64-23.4.0.24.05/instantclient_23_4",
});

// 허용된 필드 리스트 (이메일 포함)
const allowedFields = ['email', 'password', 'userName', 'phoneNumber', 'joinDate'];

// 정보 업데이트 라우터
router.post('/', authenticateToken, async (req, res) => {
    console.log(req.body[0]);
    const { field, value } = req.body[0]; // 업데이트할 필드와 값
    const user = req.user; // 인증된 사용자 정보
     

    // 필드 검증
    if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: '업데이트할 수 없는 필드입니다' });
    }

    let connection;

    console.log('DB 연결 시작'); // 테스트

    // DB연결
    try {
        connection = await oracledb.getConnection({
            user: 'CGI_24S_IOT3_3',
            password: 'smhrd3',
            connectString: 'project-db-cgi.smhrd.com:1524'
        });

        // 쿼리문 직접 작성 및 파라미터 설정
        let updateQuery;
        let bindParams;

        switch (field) {
            case 'password':
                // 비밀번호는 해시화하여 저장
                const hashedPassword = await bcrypt.hash(value, 10);
                updateQuery = `UPDATE USERS SET USER_PASSWORD = :value WHERE USER_EMAIL = :email`;
                bindParams = { value: hashedPassword, email: user.email };
                break;
            case 'userName':
                updateQuery = `UPDATE USERS SET USER_NAME = :value WHERE USER_EMAIL = :email`;
                bindParams = { value: value, email: user.email };
                break;
            case 'phoneNumber':
                updateQuery = `UPDATE USERS SET PHONE_NUMBER = :value WHERE USER_EMAIL = :email`;
                bindParams = { value: value, email: user.email };
                break;
            case 'joinDate':
                // 날짜 값 변환
                const [year, month, day] = value.split('-');
                const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD 형식으로 변환
                updateQuery = `UPDATE USERS SET JOINING_DATE = TO_DATE(:value, 'YYYY-MM-DD') WHERE USER_EMAIL = :email`;
                bindParams = { value: formattedDate, email: user.email };
                break;
            case 'email':
                // 이메일 변경 처리
                updateQuery = `UPDATE USERS SET USER_EMAIL = :value WHERE USER_EMAIL = :oldEmail`;
                bindParams = { value: value, oldEmail: user.email };
                break;
            default:
                return res.status(400).json({ message: '업데이트할 수 없는 필드입니다' });
        }

        // 쿼리 실행
        const result = await connection.execute(updateQuery, bindParams, { autoCommit: true });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: '정보 업데이트 실패' });
        }

        // 이메일을 변경한 경우에는 JWT 토큰 업데이트
        if (field === 'email') {
            // 새로운 이메일로 사용자 정보 갱신
            user.email = value;
        }

        res.json({ success: true, message: `${field}이(가) 업데이트되었습니다` });

    } catch (err) {
        console.error('DB 에러:', err);
        res.status(500).send('Database error');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('DB 연결 종료 에러:', err);
            }
        }
    }
});

module.exports = router;
