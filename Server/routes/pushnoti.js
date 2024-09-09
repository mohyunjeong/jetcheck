const express = require('express');
const router = express.Router();
const { addToken } = require('./pushnotifx'); // 푸시 알림 함수 가져오기

// 토큰 저장 라우트
router.post('/', (req, res) => {
  const { token } = req.body;
  addToken(token); // 토큰 추가 함수 호출
  res.status(200).send('토큰이 성공적으로 저장되었습니다.');
});

module.exports = router;
