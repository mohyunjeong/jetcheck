import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, FlatList, ScrollView, Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/JoinStyles'; // 스타일 임포트
import { JoinScreenNavigationProp } from '../routes/types'; // 타입 정의 임포트

type Props = {
  navigation: JoinScreenNavigationProp;
}

const Join: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState({ user: '', domain: 'gmail.com' }); // 기본 도메인 설정
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<'user' | 'admin' | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [customDomain, setCustomDomain] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pickerItems] = useState([
    { label: 'gmail.com', value: 'gmail.com' },
    { label: 'naver.com', value: 'naver.com' },
    { label: 'hanmail.net', value: 'hanmail.net' },
    { label: '직접 입력', value: 'custom' }
  ]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSignupButtonDisabled, setIsSignupButtonDisabled] = useState(true);

  // 이메일 중복 검사
  const checkEmailAvailability = async (user: string, domain: string) => {
    const email = `${user}@${domain}`;
    try {
      const response = await fetch('http://192.168.219.48:3000/checkEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (result.exists) {
        setEmailError('중복된 이메일입니다. 다른 이메일을 입력해주세요.');
        setIsSignupButtonDisabled(true);
      } else {
        setEmailError(null);
        setIsSignupButtonDisabled(false);
      }
    } catch {
      setEmailError('이메일 확인 중 오류가 발생했습니다.');
      setIsSignupButtonDisabled(true);
    }
  };

  // 이메일 도메인 선택 처리
  const handleDomainChange = (value: string) => {
    if (value === 'custom') {
      setEmail({ ...email, domain: '' });
      setCustomDomain(email.domain);
    } else {
      setEmail({ ...email, domain: value });
      setCustomDomain('');
    }
    setIsModalVisible(false);
  };

  // 이메일 사용자 입력 처리
  const handleEmailChange = (text: string) => {
    setEmail({ ...email, user: text });
  };

  // 이메일 도메인 입력 처리
  const handleCustomDomainChange = (text: string) => {
    setCustomDomain(text);
  };

  // 이메일 도메인 선택 후 확인
  useEffect(() => {
    if (email.domain && email.user) {
      checkEmailAvailability(email.user, email.domain);
    }
  }, [email.domain]);

  // 직접 입력 후 이메일 확인
  useEffect(() => {
    if (email.domain === customDomain) {
      checkEmailAvailability(email.user, email.domain);
    }
  }, [customDomain]);

  // 날짜 선택 처리
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setDatePickerVisible(false);
      return;
    }
    
    const currentDate = selectedDate || date;
    if (currentDate.toISOString().slice(0, 10) !== joinDate) {
      setDate(currentDate);
      setJoinDate(currentDate.toISOString().slice(0, 10));
    }
    
    setDatePickerVisible(false);
  };  

  // 비밀번호와 비밀번호 확인 상태 결정
  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError('비밀번호가 동일하지 않습니다.');
    } else {
      setPasswordError(null);
    }
  }, [password, confirmPassword]);

  // 회원가입 버튼 활성화 상태 결정
  useEffect(() => {
    const isFormComplete = email.user && email.domain && password && confirmPassword && name && phone && joinDate && selectedPermission;
    const passwordsMatch = password === confirmPassword;
    setIsSignupButtonDisabled(
      !(isFormComplete && passwordsMatch) || !!emailError || !!passwordError
    );
  }, [email, password, confirmPassword, name, phone, joinDate, selectedPermission, emailError, passwordError]);

  // Handle Permission Click
  const handlePermissionClick = (permission: 'user' | 'admin') => {
    setSelectedPermission(permission);
  };

  // 회원가입 함수
  const handleSignup = async () => {
    if (isSignupButtonDisabled) {
      Alert.alert('회원가입 오류', '모든 필드를 올바르게 입력해 주세요.');
      return;
    }
  
    const userRole = selectedPermission === 'admin' ? 'M' : 'U';
  
    try {
      const response = await fetch('http://192.168.219.48:3000/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `${email.user}@${email.domain}`,
          password,
          name,
          phone,
          joinDate,
          userRole,
        }),
      });
  
      const contentType = response.headers.get('Content-Type');
  
      if (contentType?.includes('application/json')) {
        const result = await response.json();
  
        if (response.status === 200) {
          Alert.alert('회원가입 성공', '회원가입이 완료되었습니다.');
          navigation.navigate('Login'); // 회원가입 성공 후 Login 페이지로 이동
        } else {
          Alert.alert('회원가입 오류', result.message || '회원가입 중 오류가 발생했습니다.');
        }
      } else {
        const text = await response.text();
        Alert.alert('회원가입 오류', `서버에서 올바른 JSON 응답을 받지 못했습니다. 응답: ${text}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('회원가입 오류', `서버와의 연결이 실패했습니다. ${error.message}`);
      } else {
        Alert.alert('회원가입 오류', '서버와의 연결이 실패했습니다.');
      }
    }
  };  
  
  // 픽커
  const renderPickerItem = ({ item }: { item: { label: string; value: string } }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleDomainChange(item.value)}
    >
      <Text style={styles.modalItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image style={styles.logo} source={require('../img/logo.png')} />
      <Text style={styles.title}>Jet Check</Text>

      <View style={styles.inputContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.label}>이메일</Text>
          <View style={styles.emailContainer}>
            <TextInput
              style={styles.emailInputBox}
              value={email.user}
              onChangeText={handleEmailChange}
              placeholder="admin"
              placeholderTextColor="#504F4F"
              textAlign="left"
            />
            <Text style={styles.atSymbol}>@</Text>
            {email.domain === '' ? (
              <TextInput
                style={styles.customDomainInput}
                value={customDomain}
                onChangeText={handleCustomDomainChange}
                placeholder="직접 입력"
                placeholderTextColor="#504F4F"
                textAlign="left"
                onBlur={() => {
                  if (customDomain) {
                    setEmail({ ...email, domain: customDomain });
                    checkEmailAvailability(email.user, customDomain);
                  }
                }}
              />
            ) : (
              <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>{email.domain || '도메인 선택'}</Text>
                <Icon name="arrow-drop-down" size={24} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 이메일 중복 검사 메시지 */}
        {emailError && (
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorText}>{emailError}</Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.inputBox}
            value={password}
            onChangeText={setPassword}
            placeholder="1234"
            placeholderTextColor="#504F4F"
            secureTextEntry
            textAlign="left"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={styles.inputBox}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="1234"
            placeholderTextColor="#504F4F"
            secureTextEntry
            textAlign="left"
          />
        </View>
        {passwordError && (
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorText}>{passwordError}</Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.inputBox}
            value={name}
            onChangeText={setName}
            placeholder="홍길동"
            placeholderTextColor="#504F4F"
            textAlign="left"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.label}>핸드폰 번호</Text>
          <TextInput
            style={styles.inputBox}
            value={phone}
            onChangeText={setPhone}
            placeholder="010-0000-0000"
            placeholderTextColor="#504F4F"
            textAlign="left"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.label}>입사 날짜</Text>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={styles.dateButton}>
            <TextInput
              style={styles.dateInputBox}
              value={joinDate}
              placeholder="2024-07-18"
              placeholderTextColor="#504F4F"
              editable={false}
              textAlign="left"
            />
            <View style={styles.dateIconContainer}>
              <Icon name="calendar-today" size={24} color="#888" />
            </View>
          </TouchableOpacity>
        </View>
        {datePickerVisible && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <View style={styles.permissionsContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.label}>사용 권한</Text>
          <View style={styles.permissionOptions}>
            <TouchableOpacity
              onPress={() => handlePermissionClick('user')}
              style={styles.permissionOption}
            >
              <Text style={styles.permissionText}>사용자</Text>
              <CheckBox
                value={selectedPermission === 'user'}
                onValueChange={() => handlePermissionClick('user')}
                style={styles.checkbox}
                tintColors={{ true: '#29FFF4', false: '#29FFF4' }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlePermissionClick('admin')}
              style={styles.permissionOption}
            >
              <Text style={styles.permissionText}>관리자</Text>
              <CheckBox
                value={selectedPermission === 'admin'}
                onValueChange={() => handlePermissionClick('admin')}
                style={styles.checkbox}
                tintColors={{ true: '#29FFF4', false: '#29FFF4' }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.signupButton, isSignupButtonDisabled && styles.disabledButton]}
        disabled={isSignupButtonDisabled}
        onPress={handleSignup}
      >
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>

      {/* Modal for Picker */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <FlatList
            data={pickerItems}
            renderItem={renderPickerItem}
            keyExtractor={(item) => item.value}
            style={styles.modalList}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Join;
