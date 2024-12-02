import { TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Container from '../../components/Container';
import { Button, Input, Section, Space } from '@bsdaoquang/rncomponent';
import TextComponent from '../../components/TextComponent';
import { fontFamilies } from '../../constants/fontFamilies';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../../constants/colors';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'

const initialValue = {
  userName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const SignUp = ({ navigation }: any) => {
  const [signUpForm, setSignUpForm] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (
      !signUpForm.userName ||
      !signUpForm.email ||
      !signUpForm.password ||
      !signUpForm.confirmPassword
    ) {
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Hãy điền chính xác và đầy đủ thông tin',
      });
      console.log('aloalo');
      return;
    }
  
    if (signUpForm.password !== signUpForm.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Mật khẩu và xác nhận mật khẩu không khớp',
      });
      return;
    }
  
    setIsLoading(true);
    try {
      const credentialUser = await auth().createUserWithEmailAndPassword(
        signUpForm.email,
        signUpForm.password,
      );
      const user = credentialUser.user;
  
      if (user) {
        // Cập nhật tên người dùng trong Firebase Auth
        if (signUpForm.userName) {
          await user.updateProfile({
            displayName: signUpForm.userName,
          });
        }
  
        // Lưu thông tin vào Firestore
        await firestore().collection('users').doc(user.uid).set({
          userName: signUpForm.userName,
          email: signUpForm.email,
          createdAt: firestore.FieldValue.serverTimestamp(), // Thời gian tạo
        });
  
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đăng ký thành công',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Đăng ký thất bại, vui lòng thử lại',
      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangeValue = (key: string, value: string) => {
    setSignUpForm(prevForm => ({ ...prevForm, [key]: value }));
  };

  return (
    <Container>
      <Section>
        <Space height={10} />
        <TextComponent
          text="Đăng ký"
          font={fontFamilies.semiBold}
          size={40}
          styles={{ textAlign: 'center' }}
        />
      </Section>
      <Section>
        <View>
          <Input
            value={signUpForm.userName}
            onChange={val => handleChangeValue('userName', val)}
            label="Tên người dùng"
            clear
            prefix={<AntDesign name="user" size={20} />}
            placeholder='Nhập tên người dùng'
            required
          />
          <Input
            placeholder="Nhập email"
            value={signUpForm.email}
            onChange={val => handleChangeValue('email', val)}
            label="Email"
            clear
            prefix={<AntDesign name="mail" size={20} />}
            required
          />
          <Input
            placeholder="Nhập mật khẩu"
            value={signUpForm.password}
            onChange={val => handleChangeValue('password', val)}
            label="Mật khẩu"
            password
            clear
            prefix={<AntDesign name="lock" size={20} />}
            required
          />
          <Input
            placeholder="Nhập lại mật khẩu"
            value={signUpForm.confirmPassword}
            onChange={val => handleChangeValue('confirmPassword', val)}
            label="Xác nhận mật khẩu"
            password
            clear
            prefix={<AntDesign name="lock" size={20} />}
            required
          />
        </View>
        <Space height={20} />
        <Button
          title="Đăng ký"
          color={colors.red}
          onPress={handleSignUp}
          loading={isLoading}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 5,
            marginVertical: 5,
          }}>
          <TextComponent text="Đã có tài khoản" />
          <Space width={10} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <TextComponent
              text="Đăng nhập"
              color={colors.red}
              font={fontFamilies.medium}
            />
          </TouchableOpacity>
        </View>
      </Section>
    </Container>
  );
};

export default SignUp;