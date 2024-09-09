import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { EnvironScreenNavigationProp } from '../routes/types';
import styles from '../styles/AttendanceStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 오늘 날짜를 반환하는 함수
const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

// 주어진 날짜가 현재 날짜보다 이전인지 확인하는 함수
const isPastDate = (date: string) => {
    return new Date(date) < new Date(getToday());
};

// Base64 URL 디코딩 함수
const base64UrlDecode = (str: string) => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const jsonString = atob(base64);
    return JSON.parse(decodeURIComponent(escape(jsonString)));
};

// 출퇴근 데이터 타입 정의
type AttendanceData = {
    userName: string;
    INTime: string | null;
    OUTTime: string | null;
    starred: boolean; // 별 상태 추가
};

const Attendance: React.FC = () => {
    const navigation = useNavigation<EnvironScreenNavigationProp>();
    const [userEmail, setUserEmail] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(getToday());
    const [inTime, setInTime] = useState<string | null>(null);
    const [outTime, setOutTime] = useState<string | null>(null);
    const [attendanceData, setAttendanceData] = useState<AttendanceData[] | null>([]);

    // 토큰에서 사용자 이메일과 역할을 가져오는 함수
    const getUserEmailAndRoleFromToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const [, payload] = token.split('.');
                if (payload) {
                    try {
                        const decodedPayload = base64UrlDecode(payload);
                        console.log(decodedPayload);
                        if (decodedPayload) {
                            if (decodedPayload.email) {
                                setUserEmail(decodedPayload.email);
                            }
                            if (decodedPayload.userRole) {
                                setUserRole(decodedPayload.userRole);
                            }
                        }
                    } catch (decodeError) {
                        console.error('디코딩 오류:', decodeError);
                    }
                }
            } else {
                console.warn('토큰이 없습니다');
            }
        } catch (error) {
            console.error('토큰 가져오기 오류:', error);
        }
    };

    useEffect(() => {
        getUserEmailAndRoleFromToken();
    }, []);

    // 아이콘 클릭 핸들러
    const handleIconPress = (index: number) => {
        setAttendanceData(prevData => {
            if (prevData) {
                const newData = [...prevData];
                newData[index].starred = !newData[index].starred;
                return newData;
            }
            return [];
        });
    };

    // 날짜 선택 핸들러
    const handleDayPress = async (day: DateData) => {
        const date = day.dateString;
        setSelectedDate(date);
        await fetchAttendanceData(date);
    };

    // 출퇴근 데이터 가져오기
    const fetchAttendanceData = async (date: string) => {
        try {
            const response = await fetch('http://192.168.219.48:3000/checkinfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_email: userEmail,
                    check_time: date,
                    user_role: userRole,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.data && data.data.length > 0) {
                    const formattedData: AttendanceData[] = data.data.map((item: any) => ({
                        userName: item.userName,
                        INTime: item.INTime || null,
                        OUTTime: item.OUTTime || null,
                        starred: false, 
                    }));
                    // 가나다 순으로 정렬
                    formattedData.sort((a: AttendanceData, b: AttendanceData) => a.userName.localeCompare(b.userName));
                    console.log(formattedData);
                    setAttendanceData(formattedData.length > 0 ? formattedData : null);
                } else {
                    setAttendanceData(null);
                    Alert.alert('출퇴근 정보', '출퇴근 정보가 존재하지 않습니다.');
                }
            } else {
                Alert.alert('오류', data.message);
            }
        } catch (error) {
            console.error('서버 요청 오류:', error);
            Alert.alert('서버 오류', '출퇴근 기록 오류');
        }
    };

    // 출퇴근 버튼 클릭 핸들러
    const handleAttendanceButtonPress = async () => {
        const currentTime = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        });

        if (!inTime) {
            setInTime(currentTime);
            await sendAttendanceRequest('IN');
        } else if (!outTime) {
            setOutTime(currentTime);
            await sendAttendanceRequest('OUT');
        } else {
            setInTime(null);
            setOutTime(null);
            await sendAttendanceRequest('RESET');
        }
    };

    // 출퇴근 요청 보내기
    const sendAttendanceRequest = async (attType: string) => {
        try {
            if (!userEmail || !userRole) {
                Alert.alert('오류', '사용자 정보가 부족합니다');
                return;
            }

            const response = await fetch('http://192.168.219.48:3000/checkInOut', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_email: userEmail,
                    workplace_idx: 1,
                    att_type: attType,
                    user_role: userRole,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('성공', data.message);
            } else {
                Alert.alert('오류', data.message);
            }
        } catch (error) {
            console.error('서버 요청 오류:', error);
            Alert.alert('서버 오류', '출퇴근 기록 오류');
        }
    };

    // 상태 결정
    const determineStatus = () => {
        if (inTime && outTime) {
            return '작업 완료';
        } else if (inTime) {
            return '작업 중';
        } else {
            return '작업 전';
        }
    };

    const buttonText = !inTime ? '출근' : !outTime ? '퇴근' : '출근';
    const status = determineStatus();
    const showButton = !isPastDate(selectedDate);

    useFocusEffect(
        useCallback(() => {
            setSelectedDate(getToday());
        }, [])
    );

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer1}>
                <Icon name="star" size={20} color="#034198" />
            </View>
            <TouchableOpacity style={styles.iconContainer2} onPress={() => navigation.navigate('Environment')}>
                <Icon name="map" size={20} color="#034198" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconContainer3} onPress={() => navigation.navigate('Mypage')}>
                <Icon name="user" size={20} color="#034198" />
            </TouchableOpacity>

            <View style={styles.lineTop} />

            <View style={styles.calendar}>
                <Calendar
                    current={selectedDate}
                    onDayPress={handleDayPress}
                    markedDates={{ [selectedDate]: { selected: true, selectedTextColor: 'white' } }}
                />
            </View>

            <View style={styles.lineMiddle} />

            <View style={styles.iconContainer5}>

                <Text style={styles.date}>{selectedDate}</Text>

                {attendanceData && attendanceData.map((data: AttendanceData, index: number) => (
                    <View key={index} style={styles.info}>
                        <View style={styles.line} />

                        <TouchableOpacity onPress={() => handleIconPress(index)} style={styles.iconContainer4}>
                            <Icon 
                                name={data.starred ? "star" : "star-o"}
                                size={20} 
                                color="#034198" 
                            />
                        </TouchableOpacity>

                        <View style={styles.circle} />
                        <Text style={styles.position}>{userRole === 'M' ? '관리자' : '사용자'}</Text>
                        
                        <Text style={styles.titleName}>이름</Text>
                        <Text style={styles.name}>{data.userName || '홍길동'}</Text>

                        <Text style={styles.titleInTime}>출근시간</Text>
                        <Text style={styles.inTime}>{data.INTime || '없음'}</Text>

                        <Text style={styles.titleOutTime}>퇴근시간</Text>
                        <Text style={styles.outTime}>{data.OUTTime || '없음'}</Text>
                        
                        <Text style={styles.titleStatus}>상태</Text>
                        <Text style={styles.status}>{status}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.lineBottom} />

            {showButton && (
                <TouchableOpacity style={styles.attendanceButton} onPress={handleAttendanceButtonPress}>
                    <Text style={styles.titleAttendance}>{buttonText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default Attendance;
