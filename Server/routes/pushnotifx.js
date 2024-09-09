const admin = require('firebase-admin');

// Firebase Admin SDK 초기화 (이미 초기화된 경우 생략)
if (!admin.apps.length) {
  const serviceAccount = require('../path/to/tcake-cf81d-firebase-adminsdk-blt4n-9c28340bfc.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 전역으로 사용할 토큰 배열
let tokens = [];

// 푸시 알림 전송 함수
function sendPushNotification(title, body) {
  if (tokens.length === 0) {
    console.log('저장된 토큰이 없습니다.');
    return;
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: tokens,
  };

  admin.messaging().sendMulticast(message)
    .then((response) => {
      console.log('푸시 알림이 성공적으로 전송되었습니다:', response.successCount);
    })
    .catch((error) => {
      console.error('푸시 알림 전송에 실패했습니다:', error);
    });
}

// 토큰 추가 함수
function addToken(token) {
  if (token && !tokens.includes(token)) {
    tokens.push(token);
  }
}

module.exports = { sendPushNotification, addToken, tokens };
