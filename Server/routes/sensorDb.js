const oracledb = require('oracledb');
const cron = require('node-cron');

// 오라클 클라이언트 경로 설정
oracledb.initOracleClient({
  libDir: "C:/oracle/instantclient-basic-windows.x64-23.4.0.24.05/instantclient_23_4",
});

// 임시 저장소
let lastSensorData = null;

// 데이터 저장 함수
async function saveSensorData(sensorData) {
  let connection;

  try {
    // 데이터베이스 연결
    connection = await oracledb.getConnection({
      user: 'CGI_24S_IOT3_3',
      password: 'smhrd3',
      connectString: 'project-db-cgi.smhrd.com:1524'
    });


    // 데이터베이스에 센서 데이터 저장
    await connection.execute(
      `INSERT INTO ENVS (TEMPERATURE, HUMIDITY, CO2, GAS, DANGER_OF_FIRE)
       VALUES (:temperature, :humidity, :co2, :gas, :danger_of_fire)`,
      {
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        co2: sensorData.co2,
        gas: sensorData.gas,
        danger_of_fire: sensorData.danger_of_fire
      },
      { autoCommit: true }
    );

  } catch (err) {
    console.error('데이터베이스 오류:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('연결 종료 오류:', err);
      }
    }
  }
}

// 6시간마다 저장 함수 실행
cron.schedule('0 */6 * * *', async () => {
  if (lastSensorData) {
    try {
      await saveSensorData(lastSensorData);  
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
    }
  }
}, {
  scheduled: true,
  timezone: "Asia/Seoul"
});

// 센서 데이터 저장 임시 저장소에 추가
function addSensorData(sensorData) {
  lastSensorData = sensorData; // 최신 데이터로 덮어쓰기
}

// 센서 데이터 조회 함수
function getTempSensorData() {
  return lastSensorData; // 현재 임시 저장소에 있는 센서 데이터를 반환
}

module.exports = {
  addSensorData,
  getTempSensorData
};
