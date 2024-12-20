import { Section, Space } from '@bsdaoquang/rncomponent';
import auth from '@react-native-firebase/auth';
import { useState, useEffect } from 'react';
import { Image, TouchableOpacity, View, useColorScheme } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../constants/theme'; // Update colors to support dark/light mode
import { fontFamilies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
import Container from '../../components/Container';
import TextComponent from '../../components/TextComponent';
import React from 'react';
import Row from '../../components/Row';

const Profile = ({ navigation }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const user = auth().currentUser;
  const userEmail = user?.email;
  const colorScheme = useColorScheme(); // Nhận diện chế độ sáng/tối của hệ thống
  const [currentTheme, setCurrentTheme] = useState(colorScheme); // Trạng thái cho theme
  const themeColors = currentTheme === 'dark' ? theme.dark : theme.light; // Chọn màu sắc tùy theo chế độ

  const toggleExample = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
  };

  return (
    <Container style={{ backgroundColor: themeColors.background }}>
      <Row styles={{ flexDirection: 'column', alignItems: 'center', padding: 20 }}>
        <Image
          source={require('../../../assets/images/luffy.jpg')}
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            borderWidth: 3,
            borderColor: themeColors.border,
          }}
        />
        {user?.photoURL ? (
          <Row alignItems="center">
            <Row
              styles={{
                position: 'relative',
                borderRadius: 100,
                width: 40,
                height: 40,
                overflow: 'hidden',
              }}
            >
              <Image source={{ uri: user.photoURL }} style={{ width: 40, height: 40 }} />
            </Row>
            <Space width={12} />
            <TextComponent
              styles={{ marginBottom: 3 }}
              font={fontFamilies.semiBold}
              size={sizes.bigTitle}
              color={themeColors.text}
              text={user?.displayName ?? 'Người dùng'}
            />
          </Row>
        ) : (
          <TextComponent
            font={fontFamilies.semiBold}
            size={sizes.bigTitle}
            color={themeColors.text}
            text={user?.displayName ?? 'Người dùng'}
          />
        )}
      </Row>

      <Space height={30} />

      <Section styles={{ paddingBottom: 30 }}>
        <Row styles={{ flexDirection: 'column' }}>
          <Row
            onPress={toggleExample}
            styles={{
              width: '100%',
              paddingVertical: 12,
              borderBottomColor: themeColors.border,
              borderBottomWidth: 1,
            }}
            justifyContent="space-between"
            flex={1}
          >
            <Row>
              <AntDesign name="user" color={themeColors.icon} size={sizes.icon} />
              <Space width={12} />
              <TextComponent
                color={themeColors.text}
                text="Thông tin tài khoản"
                size={sizes.title}
                font={fontFamilies.medium}
              />
            </Row>
            <Entypo name="chevron-small-right" size={sizes.icon} color={themeColors.icon} />
          </Row>

          {isExpanded && (
            <Section styles={{ flexDirection: 'column' }}>
              <TouchableOpacity
                onPress={() => { }}
                style={{
                  width: '100%',
                  borderBottomColor: themeColors.border,
                  borderBottomWidth: 1,
                  paddingVertical: 8,
                }}
              >
                <Row>
                  <AntDesign name="mail" color={themeColors.icon} size={sizes.icon} />
                  <Space width={12} />
                  <TextComponent text={userEmail ?? ''} color={themeColors.text} />
                </Row>
              </TouchableOpacity>

              <Space height={8} />

              <TouchableOpacity onPress={() => navigation.navigate('UpdateProfile')}>
                <Row
                  justifyContent="flex-start"
                  styles={{
                    width: '100%',
                    borderBottomColor: themeColors.border,
                    borderBottomWidth: 1,
                    paddingVertical: 8,
                  }}
                >
                  <Ionicons name="information-circle-outline" color={themeColors.icon} size={sizes.icon} />
                  <Space width={12} />
                  <TextComponent text="Cập nhật thông tin" color={themeColors.text} />
                </Row>
              </TouchableOpacity>

              <Space height={8} />

              <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
                <Row
                  justifyContent="flex-start"
                  styles={{
                    width: '100%',
                    borderBottomColor: themeColors.border,
                    borderBottomWidth: 1,
                    paddingVertical: 8,
                  }}
                >
                  <AntDesign name="lock1" color={themeColors.icon} size={sizes.icon} />
                  <Space width={12} />
                  <TextComponent text="Đổi mật khẩu" color={themeColors.text} />
                </Row>
              </TouchableOpacity>
            </Section>
          )}

          <Row
            onPress={() => auth().signOut()}
            styles={{
              width: '100%',
              paddingVertical: 12,
              borderBottomColor: themeColors.border,
              borderBottomWidth: 1,
            }}
            justifyContent="space-between"
            flex={1}
          >
            <Row>
              <AntDesign name="logout" color={themeColors.icon} size={sizes.icon} />
              <Space width={12} />
              <TextComponent color={themeColors.text} text="Đăng xuất" font={fontFamilies.medium} size={sizes.title} />
            </Row>
            <Entypo name="chevron-small-right" size={sizes.icon} color={themeColors.icon} />
          </Row>

          {/* Nút chuyển theme */}
          <Row onPress={toggleTheme} styles={{ marginTop: 20 }}>
            <Ionicons
              name={currentTheme === 'dark' ? 'sunny' : 'moon'}
              color={themeColors.icon}
              size={sizes.icon}
            />
            <Space width={12} />
            <TextComponent
              color={themeColors.text}
              text={currentTheme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
              font={fontFamilies.medium}
              size={sizes.title}
            />
          </Row>
        </Row>
      </Section>
    </Container>
  );
};

export default Profile;
