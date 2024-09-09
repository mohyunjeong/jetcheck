const express = require('express');
const router = express.Router();
const { getTempSensorData } = require('./sensorDb');

// 실시간 센서 데이터 조회
router.get('/', (req, res) => {
  const sensorData = getTempSensorData();
  
  // 센서데이터가 있다면 http://192.168.219.48:3000/sensorSend로 센서데이터 전송
  if (sensorData) {
  sensorData.co2 = Math.round(sensorData.co2);
  sensorData.gas = Math.round(sensorData.gas);
    console.log(sensorData);
    res.status(200).json(sensorData);
  } else {
    res.status(404).send('센서 데이터가 없습니다.');
  }
});

module.exports = router;
