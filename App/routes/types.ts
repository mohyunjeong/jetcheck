// routes/types.ts

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Join: undefined;
  Attendance: undefined;
  Environment: undefined;
  Mypage: undefined;
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export type JoinScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Join'>;

export type EnvironScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Environment'>;

export type AttenScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Attendance'>;

export type MypageScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Mypage'>;
