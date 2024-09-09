import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreenNavigationProp } from '../routes/types'; // 타입 임포트
import styles from '../styles/LoginStyles'; // 스타일 임포트

type Props = {
  navigation: LoginScreenNavigationProp; // navigation의 타입 지정
};

const Login = ({ navigation }: Props) => {
  const [isChecked, setIsChecked] = useState(false); // 자동 로그인 체크 상태
  const [email, setEmail] = useState(""); // 이메일 상태
  const [password, setPassword] = useState(""); // 비밀번호 상태

  useEffect(() => {
    const loadAutoLoginPreference = async () => {
      try {
        // AsyncStorage에서 자동 로그인 설정 값 가져오기
        const autoLogin = await AsyncStorage.getItem('autoLogin');
        setIsChecked(autoLogin === 'true'); // 체크박스 상태 설정
      } catch (error) {
        console.error('자동 로그인 설정을 불러오는 데 실패했습니다.', error);
      }
    };

    loadAutoLoginPreference();
  }, []);

  // 체크박스 토글 함수
  const toggleCheckBox = async () => {
    const newValue = !isChecked; // 현재 상태 반전
    setIsChecked(newValue); // 상태 업데이트
    await AsyncStorage.setItem('autoLogin', newValue.toString()); // AsyncStorage에 상태 저장
  };

  // 로그인 처리 함수
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('로그인 오류', '아이디와 비밀번호를 입력해 주세요.'); // 이메일 또는 비밀번호가 비어있는 경우 경고
      return;
    }

    try {
      const response = await fetch('http://192.168.219.48:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // 요청 본문에 이메일과 비밀번호 포함
      });

      const result = await response.json(); // 서버 응답 JSON으로 변환

      if (response.ok && result.success) {
        // 로그인 성공 시
        await AsyncStorage.setItem('userToken', result.token); // 사용자 토큰 저장
        if (isChecked) {
          await AsyncStorage.setItem('autoLogin', 'true'); // 자동 로그인 설정 저장
        }
        Alert.alert('로그인 성공', '로그인에 성공했습니다.'); // 성공 알림
        navigation.navigate('Attendance'); // Attendance 화면으로 이동
      } else {
        // 로그인 실패 시
        Alert.alert('로그인 실패', result.message || '아이디 혹은 비밀번호가 틀립니다.'); // 서버 메시지 또는 기본 메시지 표시
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('로그인 실패', `오류가 발생했습니다: ${error.message}`); // 오류 메시지 표시
      } else {
        Alert.alert('로그인 실패', '알 수 없는 오류가 발생했습니다.'); // 알 수 없는 오류 메시지 표시
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../img/logo.png')} />
      <Text style={styles.title}>Jet Check</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.idText}>아이디</Text>
        <TextInput
          style={styles.inputBox}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#504F4F"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.passwordText}>비밀번호</Text>
        <TextInput
          style={styles.inputBox}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#504F4F"
          secureTextEntry
        />
      </View>

      <View style={styles.autoLoginContainer}>
        <TouchableOpacity onPress={toggleCheckBox} style={styles.autoLoginTextWrapper}>
          <Text style={styles.autoLoginText}>자동 로그인</Text>
        </TouchableOpacity>
        <CheckBox
          value={isChecked}
          onValueChange={setIsChecked}
          tintColors={{ true: '#29FFF4', false: '#29FFF4' }} // 체크박스 색상 변경
          style={styles.checkbox}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.signupButton}
          onPress={() => navigation.navigate('Join')} // 회원가입 버튼 클릭 시 Join 화면으로 이동
        >
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
