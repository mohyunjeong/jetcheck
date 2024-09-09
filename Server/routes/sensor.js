const express = require('express');
const router = express.Router();
const { addSensorData } = require('./sensorDb'); // 같은 폴더에서 가져오기

// 화재 위험도 계산 함수
function calculateFireRisk(temperature, co2, gas, humidity) {
  const T_base = 20; // 기준 온도 (°C)
  const T_max = 80;  // 최대 안전 온도 (°C)
  const CO2_base = 400; // 기준 CO2 농도 (ppm)
  const CO2_max = 2000; // 최대 안전 CO2 농도 (ppm)
  const Gas_base = 0; // 기준 가스 농도 (ppm)
  const Gas_max = 1000; // 최대 안전 가스 농도 (ppm)
  const H_base = 30; // 기준 습도 (%)
  const H_max = 80; // 최대 안전 습도 (%)

  const W_T = 0.4; // 온도 가중치
  const W_CO2 = 0.3; // CO2 농도 가중치
  const W_Gas = 0.2; // 가스 농도 가중치
  const W_H = 0.1; // 습도 가중치

  const tempRisk = (temperature - T_base) / (T_max - T_base) * W_T;
  const co2Risk = (co2 - CO2_base) / (CO2_max - CO2_base) * W_CO2;
  const gasRisk = (gas - Gas_base) / (Gas_max - Gas_base) * W_Gas;
  const humidityRisk = (humidity - H_base) / (H_max - H_base) * W_H;

  const fireRisk = tempRisk + co2Risk + gasRisk - humidityRisk;

  return Math.min(Math.max(fireRisk, 0), 1);
}

// 클라이언트로부터 센서 데이터 받기
router.post('/', (req, res) => {
  let { temperature, humidity, co2, gas } = req.body;
  const danger_of_fire = Math.round(calculateFireRisk(temperature, co2, gas, humidity) * 100);
 
  const sensorData = {
    temperature,
    humidity,
    co2,
    gas,
    danger_of_fire
  };

  addSensorData(sensorData);

  res.status(200).send('센서 데이터가 성공적으로 수신되었습니다.');
});

module.exports = router;
