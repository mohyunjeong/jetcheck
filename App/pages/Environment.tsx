import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // FontAwesome 아이콘 사용
import { useNavigation } from '@react-navigation/native'; // 네비게이션 훅
import { AttenScreenNavigationProp } from '../routes/types'; // 네비게이션 타입 import
import styles from '../styles/EnvironmentStyles'; // 스타일을 별도의 파일에서 불러옵니다

const Environment: React.FC = () => {
    const navigation = useNavigation<AttenScreenNavigationProp>(); // 네비게이션 훅 사용

    // 상태 정의
    const [temperature, setTemperature] = useState<number | null>(null);
    const [humidity, setHumidity] = useState<number | null>(null);
    const [c02, setC02] = useState<number | null>(null);
    const [dangerOfFire, setDangerOfFire] = useState<number | null>(null);
    const [gas, setGas] = useState<number | null>(null);

    // 범위 정의
    const ranges = {
        temperature: [20, 40],
        humidity: [55, 80],
        co2: [1200, 2000],
        fire: [40, 50],
        gas: [500, 1000]
    };

    // 현재 시간을 'HH:mm' 형식으로 가져오는 함수
    const getCurrentTime = (): string => {
      const now = new Date();
      return now.toTimeString().substring(0, 5); // 'HH:mm' 형식으로 변환
    };

    // 현재 날짜를 'yyyy.MM.dd' 형식으로 가져오는 함수
    const getCurrentDate = (): string => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    };

    // 데이터 요청 함수
    const fetchSensorData = async () => {
      try {
        // 서버에서 센서 데이터 요청
        const response = await fetch('http://192.168.219.48:3000/sensorSend');

        if (!response.ok) {
          // 응답이 성공적이지 않을 경우 에러 처리
          throw new Error('서버에서 데이터를 가져오는 데 실패했습니다.');
        }

        const data = await response.json();

        // 응답 받은 데이터로 상태 업데이트
        setTemperature(data.temperature);
        setHumidity(data.humidity);
        setC02(data.co2);
        setDangerOfFire(data.danger_of_fire);
        setGas(data.gas);
      } catch (error) {
        // 에러 발생 시 콘솔에 에러 메세지 출력
        console.log('센서 데이터를 가져오는데 실패했습니다.', error);
      }
    };

    // 컴포넌트 마운트 시 데이터 요청
    useEffect(() => {
      fetchSensorData();
    }, []);

    // 범위에 따라 텍스트 색상 결정 함수
    const getColorForValue = (value: number | null, ranges: number[]) => {
      if (value == null) return 'black';
      if (value < ranges[0]) return 'black';
      if (value <= ranges[1]) return '#FFC939';
      return 'red';
    }

    // 화재 위험성에 따라 적정, 주의, 화재 위험으로 텍스트와 이미지 결정
    const getFireRiskInfo = (value: number | null) => {
      if (value === null) return { text: '오류', color: 'black', image: require('../img/logo.png') };
      if (value < 40) return { text: '안전', color: 'green', image: require('../img/check.png') };
      if (value <= 50) return { text: '주의', color: '#FFC939', image: require('../img/warning.png') };
      return { text: '위험', color: 'red', image: require('../img/fire.png') };
    }

    // 아이콘 클릭 시 페이지 이동
    const handleCalendarIconPress = () => {
      navigation.navigate('Attendance');
    };

    const handleUserIconPress = () => {
      navigation.navigate('Mypage');
    };

    // 값을 변경하는 함수
    const handleValueChange = (label: string, value: number | null, setValue: React.Dispatch<React.SetStateAction<number | null>>, ranges: number[]) => {
      Alert.prompt(
        `${label} 값 변경`,
        `현재 ${label} 값: ${value !== null ? value.toString() : '없음'}`,
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '변경',
            onPress: (text) => {
              if (text !== undefined) {
                const newValue = parseInt(text, 10); // undefined 처리 후 파싱
                if (!isNaN(newValue)) {
                  setValue(newValue);
                }
              }
            },
          },
        ],
        'plain-text',
        value !== null ? value.toString() : '0'
      );
    };

    const fireRiskInfo = getFireRiskInfo(dangerOfFire);

    return (
      <View style={styles.container}>

        {/* 아이콘 */}
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.icon} onPress={handleCalendarIconPress}>
            <Icon name="calendar" size={20} color="#034198" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon} onPress={handleUserIconPress}>
            <Icon name="user" size={20} color="#034198" />
          </TouchableOpacity>
        </View>

        {/* 상단의 파란색 선 */}
        <View style={styles.topLine} />

        {/* 화재 위험성 정보 */}
        <View style={styles.imgContainer}>
          {/* 날짜 및 시간 */}
          <View style={styles.dateTime}>
            <Text style={styles.time}>{getCurrentTime()}</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
          </View>

          {/* 이미지 */}
          <Image
            style={styles.image}
            source={fireRiskInfo.image}
          />

          {/* 화재 위험 텍스트 */}
          <Text style={[styles.warningText, { color: fireRiskInfo.color }]}>{fireRiskInfo.text}</Text>
        </View>

        {/* 하단의 파란색 선 */}
        <View style={styles.middleLine} />

        {/* 정보 박스 */}
        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <TouchableOpacity onPress={() => handleValueChange('온도', temperature, setTemperature, ranges.temperature)}>
              <Text style={styles.infoText}>온도</Text>
              <Text style={[styles.infoValue, { color: getColorForValue(temperature, ranges.temperature) }]}>
                {temperature !== null ? `${temperature}°C` : '데이터 없음'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <TouchableOpacity onPress={() => handleValueChange('습도', humidity, setHumidity, ranges.humidity)}>
              <Text style={styles.infoText}>습도</Text>
              <Text style={[styles.infoValue, { color: getColorForValue(humidity, ranges.humidity) }]}>
                {humidity !== null ? `${humidity}%` : '데이터 없음'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <TouchableOpacity onPress={() => handleValueChange('이산화탄소', c02, setC02, ranges.co2)}>
              <Text style={styles.infoText}>이산화탄소</Text>
              <Text style={[styles.infoValue, { color: getColorForValue(c02, ranges.co2) }]}>
                {c02 !== null ? `${c02}ppm` : '데이터 없음'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <TouchableOpacity onPress={() => handleValueChange('화재위험성', dangerOfFire, setDangerOfFire, ranges.fire)}>
              <Text style={styles.infoText}>화재위험성</Text>
              <Text style={[styles.infoValue, { color: getColorForValue(dangerOfFire, ranges.fire) }]}>
                {dangerOfFire !== null ? `${dangerOfFire}%` : '데이터 없음'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <TouchableOpacity onPress={() => handleValueChange('가스누출', gas, setGas, ranges.gas)}>
              <Text style={styles.infoText}>가스누출</Text>
              <Text style={[styles.infoValue, { color: getColorForValue(gas, ranges.gas) }]}>
                {gas !== null ? `${gas}ppm` : '데이터 없음'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단의 파란색 선 */}
        <View style={styles.bottomLine} />
      </View>
    );
};

export default Environment;
