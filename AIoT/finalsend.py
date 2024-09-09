import spidev
import time
import math
import requests
import socket
import board
import adafruit_dht

# SPI 설정
SPI_BUS = 0
SPI_DEVICE = 0
SPI_MAX_SPEED_HZ = 1350000

# DHT11 센서 설정
DHT_PIN = board.D24 # DHT11 센서가 연결된 GPIO 핀 번호
dht_device = adafruit_dht.DHT11(DHT_PIN)

# MQ 센서 설정
RL_VALUE = 5.0  # 로드 저항값 (kΩ)
RO_CLEAN_AIR_FACTOR = {
    "MQ2": 9.83,    # MQ-2의 깨끗한 공기에서의 RS/RO 비율
    "MQ135": 3.6,   # MQ-135의 깨끗한 공기에서의 RS/RO 비율
}

# 예시 곡선 데이터 (실제 데이터시트를 참고하여 각 가스별로 수정 필요)
CO_CURVE = [26.57, -1.566]   # CO 곡선 데이터
CO2_CURVE = [110.47, -2.862]  # CO2 곡선 데이터

# SPI 인터페이스 초기화
spi = spidev.SpiDev()
spi.open(SPI_BUS, SPI_DEVICE)
spi.max_speed_hz = SPI_MAX_SPEED_HZ

# 서버 주소 설정
SERVER_URL = "http://192.168.219.48:3000/sensor"

def is_connected():
    """인터넷 연결 상태를 확인합니다."""
    try:
        # Google의 DNS 서버에 연결 시도
        socket.create_connection(("8.8.8.8", 53))
        return True
    except OSError:
        return False

def read_channel(channel):
    """해당 채널에서 아날로그 값을 읽습니다."""
    adc = spi.xfer2([1, (8 + channel) << 4, 0])
    data = ((adc[1] & 3) << 8) + adc[2]
    return data

def calculate_rs(adc_value):
    """ADC 값을 기반으로 센서 저항(Rs)을 계산합니다."""
    if adc_value == 0:
        return float('inf')
    return RL_VALUE * (1023.0 - adc_value) / adc_value

def calibrate(sensor_type):
    """센서를 캘리브레이션하여 RO 값을 설정합니다."""
    rs_sum = 0
    for _ in range(10):
        adc_value = read_channel(0 if sensor_type == "MQ2" else 1)
        rs_sum += calculate_rs(adc_value)
        time.sleep(0.1)
    rs_average = rs_sum / 10.0
    ro = rs_average / RO_CLEAN_AIR_FACTOR[sensor_type]
    return ro

def get_gas_ppm(rs, ro, curve):
    """RS/RO 비율을 기반으로 특정 가스의 PPM 값을 계산합니다."""
    ratio = rs / ro
    return curve[0] * math.pow(ratio, curve[1])

def read_dht11_with_retry(retries=5, delay=2):
    """DHT11 센서에서 온도와 습도를 재시도하며 읽습니다."""
    for _ in range(retries):
        try:
            humidity = dht_device.humidity
            temperature = dht_device.temperature
            if humidity is not None and temperature is not None:
                return humidity, temperature
        except RuntimeError as e:
            # DHT11은 일시적으로 읽기 실패할 수 있음
            time.sleep(delay)
    return None, None

def main():
    # 캘리브레이션 수행
    ro_mq2 = calibrate("MQ2")
    ro_mq135 = calibrate("MQ135")
    print(f"Calibration done! RO MQ2: {ro_mq2}, RO MQ135: {ro_mq135}")

    try:
        while True:
            if is_connected():
                try:
                    mq2_adc = read_channel(0)
                    mq135_adc = read_channel(1)
                    humidity, temperature = read_dht11_with_retry()

                    rs_mq2 = calculate_rs(mq2_adc)
                    rs_mq135 = calculate_rs(mq135_adc)

                    gas_ppm = get_gas_ppm(rs_mq2, ro_mq2, CO_CURVE)
                    co2_ppm = get_gas_ppm(rs_mq135, ro_mq135, CO2_CURVE)

                    if humidity is not None and temperature is not None:
                        data = {
                            "temperature": temperature,
                            "humidity": humidity,
                            "co2": co2_ppm,
                            "gas": gas_ppm,
                            "workplace_idx": 1
                        }
                        response = requests.post(SERVER_URL, data=data)
                        print(f"데이터 전송 결과: {response.status_code} {response.text}")
                    else:
                        print("DHT11 데이터 읽기 실패")

                except requests.exceptions.RequestException as e:
                    print(f"데이터 전송 중 오류 발생: {e}")

                time.sleep(10)
            else:
                print("네트워크 연결 중...")
                time.sleep(5)
    except KeyboardInterrupt:
        print("종료 중...")
    finally:
        spi.close()

if __name__ == "__main__":
    main()
