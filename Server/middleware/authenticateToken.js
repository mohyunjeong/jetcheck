const jwt = require('jsonwebtoken');

// 직접 비밀 키를 입력합니다.
const JWT_SECRET = 'qwer1234'; // 비밀 키를 여기에 입력하세요.

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // 토큰이 없는 경우

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT 검증 오류:', err);
      return res.sendStatus(403); // 토큰이 유효하지 않은 경우
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
