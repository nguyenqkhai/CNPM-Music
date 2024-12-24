import React from 'react';
import { Login, SignUp } from '../screens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotPassword from '../screens/auth/ForgotPassword';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='SignUp' component={SignUp} />
      <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
