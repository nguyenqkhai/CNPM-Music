import { View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import TextComponent from '../../components/TextComponent';
import { fontFamilies } from '../../constants/fontFamilies';
import { Input, Section, Space, Button } from '@bsdaoquang/rncomponent';
import Container from '../../components/Container';
import { colors } from '../../constants/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import { Auth } from '../../utils/handleAuth';

const Login = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Hãy điền chính xác và đầy đủ thông tin',
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      if (user) {
        await Auth.updateProfile(user);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Lỗi đăng nhập! Vui lòng kiểm tra lại thông tin',
      });
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Space height={10} />
      <View>
        <TextComponent
          text="Đăng nhập"
          font={fontFamilies.semiBold}
          size={40}
          styles={{ textAlign: 'center' }}
        />
        <Space height={40} />
      </View>
      <Section>
        <View>
          <Input
            placeholder="Nhập địa chỉ mail"
            value={email}
            onChange={setEmail}
            label="Email"
            prefix={<AntDesign name="user" size={20} />}
            required
            clear
          />
          <Space height={10} />
          <Input
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={setPassword}
            label="Mật khẩu"
            prefix={<AntDesign name="lock" size={20} />}
            password
            required
            clear
          />
        </View>
        <Space height={20} />
        <Button
          title="Đăng nhập"
          color={colors.red}
          onPress={handleLogin}
          loading={isLoading}
        />
        <Space height={10} />
        <TouchableOpacity onPress={() => { navigation.navigate('ForgotPassword') }}>
          <TextComponent
            styles={{ textAlign: 'right' }}
            text="Quên mật khẩu"
            color={colors.red}
            font={fontFamilies.medium}
          />
        </TouchableOpacity>
        <Space height={10} />
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 5,
            paddingVertical: 5,
            justifyContent: 'flex-end',
          }}>
          <TextComponent text="Chưa có tài khoản?" />
          <Space width={10} />
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <TextComponent
              text="Đăng ký"
              color={colors.red}
              font={fontFamilies.medium}
            />
          </TouchableOpacity>
        </View>
      </Section>
    </Container>
  );
};

export default Login;
