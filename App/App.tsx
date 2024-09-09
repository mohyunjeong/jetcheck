import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './pages/Login'; // Login 컴포넌트 import
import Join from './pages/Join'; // Join 컴포넌트 import
import Attendance from './pages/Attendance'; // Attendance 컴포넌트 import
import Environment from './pages/Environment'; // Environment 컴포넌트 import
import Mypage from './pages/Mypage'; // Mypage 컴포넌트 import

const Stack = createStackNavigator();

const App = (): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const autoLogin = await AsyncStorage.getItem('autoLogin');
        if (autoLogin === 'true') {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            const response = await fetch('http://192.168.219.48:3000/login/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            const result = await response.json();

            if (response.ok) {
              setUserInfo(result.decoded);
              setIsAuthenticated(true);
            } else {
              await AsyncStorage.removeItem('userToken');
            }
          }
        }
      } catch (error) {
        console.error('Failed to check token', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Attendance" : "Login"}
        screenOptions={{ headerShown: false }} // 헤더를 숨기려면 false로 설정
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Join" component={Join} />
        <Stack.Screen name="Attendance" component={Attendance} />
        <Stack.Screen name="Environment" component={Environment} />
        <Stack.Screen name="Mypage" component={Mypage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;