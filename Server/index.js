const express = require('express');
const cors = require('cors');
const app = express();

// 라우터 임포트
const signinRouter = require("./routes/signin");
const loginRouter = require("./routes/login");
const checkEmailRouter = require("./routes/checkEmail");
const sensorRouter = require("./routes/sensor");
const sensorSendRouter = require("./routes/sensorSend"); // 추가된 라우터
const infoChangeRouter = require("./routes/infoChange");
const checkInOutRouter = require("./routes/checkInOut");
const checkInfoRouter = require("./routes/checkInfo");
const pushNotiRouter = require("./routes/pushnoti");

const port = 3000;
const ip = '192.168.219.48';

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('노드 서버입니다');
});

// 라우터 사용
app.use("/signin", signinRouter); // 회원가입
app.use("/login", loginRouter); // 로그인
app.use("/checkEmail", checkEmailRouter); // 이메일 중복검사
app.use("/sensor", sensorRouter); // 센서를 받아오는 라우터
app.use("/sensorSend", sensorSendRouter); // 실시간 센서 데이터 조회 라우터 추가
app.use("/infoChange", infoChangeRouter); // 마이페이지 정보 변경
app.use("/checkInOut", checkInOutRouter); // 출퇴근시간 저장
app.use("/checkinfo", checkInfoRouter); // 출퇴근시간 확인
app.use("/pushNoti", pushNotiRouter);


app.listen(port, ip, () => {
  console.log(`Server is running at http://${ip}:${port}`);
});
