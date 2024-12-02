import React, { useEffect, useState } from 'react'
import {NavigationContainer} from '@react-navigation/native'
import AuthNavigator from './src/routers/AuthNavigator';
import MainNavigator from './src/routers/MainNavigator';
import Toast, {
  BaseToast,
  BaseToastProps,
  ErrorToast
} from 'react-native-toast-message'
import auth from '@react-native-firebase/auth'

const toastConfig = {
  success: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'pink' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
      }}
      text2Style={{
        fontSize: 15,
      }}
    />
  ),

  error: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17,
      }}
      text2Style={{
        fontSize: 15,
      }}
    />
  ),
};

const App = () => {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(()=>{
    auth().onAuthStateChanged(user => {
      setIsLogin(user ? (user?.uid ? true : false) : false);
    });
  }, [])
  return (
    <>
      <NavigationContainer>
        {!isLogin ? <AuthNavigator/> : <MainNavigator/>}
      </NavigationContainer>
      <Toast config = {toastConfig}/>
    </>
  )
}

export default App