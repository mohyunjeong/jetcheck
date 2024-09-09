import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { MypageScreenNavigationProp } from '../routes/types';
import styles from '../styles/MypageStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // Picker import

// Base64 URL 디코딩 함수
const base64UrlDecode = (str: string) => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const jsonString = atob(base64);
    return JSON.parse(decodeURIComponent(escape(jsonString)));
}

// 전화번호 포맷 함수
const formatPhoneNumber = (number: string) => {
    const cleaned = ('' + number).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return number;
}

const Mypage = () => {
    const navigation = useNavigation<MypageScreenNavigationProp>();

    // 사용자 정보를 저장하기 위한 상태
    const [userInfo, setUserInfo] = useState({
        email: '',
        password: '',
        userName: '',
        phoneNumber: '',
        joinDate: '',
        userRole: '' // 기존 값 유지
    });

    // 입력 필드 상태
    const [inputValues, setInputValues] = useState({
        email: '',
        password: '',
        userName: '',
        phoneNumber: '',
        joinDate: ''
    });

    // 역할 선택 옵션
    const roles = ['CEO', 'A-1', 'B-1', 'C-1'];

    // 로그아웃 처리 함수
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            navigation.navigate('Login'); 
        } catch (error) {
            console.error('로그아웃 오류:', error);
            Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
        }
    };

    // 사용자 정보 가져오기 함수
    const fetchUserInfo = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
    
            if (!token) {
                Alert.alert('오류', '로그인 정보가 없습니다. 다시 로그인 해주세요.');
                navigation.navigate('Login');
                return;
            }
    
            const tokenParts = token.split('.');
    
            if (tokenParts.length === 3) {
                const payload = base64UrlDecode(tokenParts[1]);
    
                setUserInfo({
                    email: payload.email || '',
                    password: payload.password || '', // 추후 보안 추가
                    userName: payload.userName || '',
                    phoneNumber: payload.phoneNumber || '',
                    joinDate: payload.joinDate || '',
                    userRole: payload.userRole || '', // 기존 값 유지
                });
    
                let year = new Date(payload.joinDate).getFullYear();
                let month = new Date(payload.joinDate).getMonth() + 1;
                let day = new Date(payload.joinDate).getDate();
                let resultDay = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

                setInputValues({
                    email: payload.email || '',
                    password: payload.password || '', // 추후 보안 추가
                    userName: payload.userName || '',
                    phoneNumber: formatPhoneNumber(payload.phoneNumber || ''),
                    joinDate: resultDay, // 날짜 포맷 수정
                });
            } else {
                Alert.alert('오류', '잘못된 토큰 형식입니다.');
            }
        } catch (error) {
            console.error('사용자 정보를 가져오는 데 실패했습니다.', error);
            Alert.alert('오류', '사용자 정보를 가져오는 데 문제가 발생했습니다.');
            navigation.navigate('Login');
        }
    };

    // 사용자 정보 수정 함수
    const handleSaveChanges = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            if (!token) {
                Alert.alert('오류', '로그인 정보가 없습니다. 다시 로그인 해주세요.');
                navigation.navigate('Login');
                return;
            }
    
            // 수정된 필드만 추출
            const changes = Object.keys(inputValues)
                .filter(key => inputValues[key as keyof typeof inputValues] !== userInfo[key as keyof typeof userInfo])
                .map(key => ({
                    field: key,
                    value: inputValues[key as keyof typeof inputValues]
                }));
    
            if (changes.length === 0) {
                Alert.alert('정보', '변경된 정보가 없습니다.');
                return;
            }
    
            // 변경 사항 저장 전에 로그아웃 확인 알림
            Alert.alert(
                '로그아웃 확인',
                '회원정보 수정 시 로그아웃이 진행됩니다.\n계속하시겠습니까?',
                [
                    {
                        text: '취소',
                        style: 'cancel'
                    },
                    {
                        text: '동의',
                        onPress: async () => {
                            try {
                                const response = await fetch('http://192.168.219.48:3000/infoChange', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify(changes),
                                });
    
                                if (!response.ok) {
                                    const errorText = await response.text();
                                    console.error(`서버 응답 오류: ${response.status} ${response.statusText}, ${errorText}`);
                                    throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
                                }
    
                                const data = await response.json();
                                await AsyncStorage.removeItem('userToken'); // 토큰 삭제
                                navigation.navigate('Login'); // 로그인 화면으로 이동
                                Alert.alert('성공', '정보가 성공적으로 저장되었습니다.');
                            } catch (error) {
                                console.error('정보 저장 오류:', error);
                                Alert.alert('오류', '정보를 저장하는 중 문제가 발생했습니다.');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('정보 저장 오류:', error);
            Alert.alert('오류', '정보를 저장하는 중 문제가 발생했습니다.');
        }
    };      

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        if (field === 'phoneNumber') {
            // 전화번호 포맷 적용
            const formattedValue = formatPhoneNumber(value);
            setInputValues(prevValues => ({
                ...prevValues,
                [field]: formattedValue,
            }));
        } else {
            setInputValues(prevValues => ({
                ...prevValues,
                [field]: value,
            }));
        }
    };

    const handleBlur = async () => {
        await handleSaveChanges();
    };

    return (
        <View style={styles.container}>

            <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Attendance')}>
                    <Icon name="calendar" size={20} color="#034198" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Environment')}>
                    <Icon name="map" size={20} color="#034198" />
                </TouchableOpacity>
            </View>

            <View style={styles.topLine} />

            <View style={styles.profilePictureContainer}>
                <View style={styles.profilePicture}>
                    <Picker
                        selectedValue={userInfo.userRole || 'A-1'} // 기본 값 'A-1'으로 설정
                        style={styles.picker}
                        onValueChange={(itemValue: string) => setUserInfo(prevState => ({ ...prevState, userRole: itemValue }))}
                    >
                        {roles.map(role => (
                            <Picker.Item key={role} label={role} value={role} />
                        ))}
                    </Picker>
                </View>
            </View>
            <Text style={styles.name}>{userInfo.userName || '이름 정보가 없습니다.'}</Text>
            <Text style={styles.role}>{userInfo.userRole === 'M' ? '관리자' : '사용자'}</Text>

            <View style={styles.separator} />

            <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>ID</Text>
                    <TextInput
                        style={styles.infoValue}
                        value={inputValues.email}
                        onChangeText={(text) => handleInputChange('email', text)}
                        onBlur={handleBlur}
                    />
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>PW</Text>
                    <TextInput
                        style={styles.infoValue}
                        value={inputValues.password}
                        secureTextEntry={true}
                        onChangeText={(text) => handleInputChange('password', text)}
                        onBlur={handleBlur}
                    />
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>이름</Text>
                    <TextInput
                        style={styles.infoValue}
                        value={inputValues.userName}
                        onChangeText={(text) => handleInputChange('userName', text)}
                        onBlur={handleBlur}
                    />
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>핸드폰 번호</Text>
                    <TextInput
                        style={styles.infoValue}
                        value={inputValues.phoneNumber}
                        onChangeText={(text) => handleInputChange('phoneNumber', text)}
                        onBlur={handleBlur}
                    />
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>입사 날짜</Text>
                    <TextInput
                        style={styles.infoValue}
                        value={inputValues.joinDate}
                        editable={false}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>

        </View>
    );
};

export default Mypage;
