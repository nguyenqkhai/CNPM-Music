/* eslint-disable react-native/no-inline-styles */
import { Button, Row, Section, Space } from '@bsdaoquang/rncomponent';
import auth from '@react-native-firebase/auth';
import { useState } from 'react';
import { Image, ImageBackground, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TextComponent from '../../components/TextComponent'
import Container from '../../components/Container'
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
import { validateEmail } from '../../utils/helper';
import Input from '../../components/InputComponent';

const ForgotPassword = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleForgotPassword = async () => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Thông báo',
                text2: 'Hãy điền thông tin email',
            });
            return;
        }

        setIsLoading(true);
        await auth()
            .sendPasswordResetEmail(email)
            .then(() => {
                Toast.show({
                    type: 'info',
                    text1: 'Thông báo',
                    text2: 'Email đã được gửi tới mail của bạn',
                }),
                    setEmail('');
            })
            .catch((error: any) => {
                Toast.show({
                    type: 'error',
                    text1: 'Thông báo',
                    text2: 'Hãy điền chính xác email nhé',
                });
                console.log(error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Container isScroll={false}>
            <View style={{ flex: 1, height: '100%' }}>
                <Section
                    styles={{
                        position: 'absolute',
                        top: 40,
                        paddingHorizontal: 8,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                    }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={36} color={colors.black} />
                    </TouchableOpacity>
                </Section>
                <Section styles={{ zIndex: 100 }}>
                    <Row
                        justifyContent="center"
                        styles={{
                            flexDirection: 'column',
                            height: sizes.height,
                        }}>
                        <Space height={24} />
                        <Row alignItems="flex-start" styles={{ flexDirection: 'column' }}>
                            <TextComponent
                                font={fontFamilies.semiBold}
                                color={colors.black}
                                text="Quên mật khẩu"
                            />
                            <Space height={16} />
                            <Input
                                required
                                helpText={
                                    !validateEmail(email)
                                        ? 'Hãy nhập đúng định dạng email'
                                        : 'Hãy nhập email'
                                }
                                inputStyles={{
                                    color: colors.black2,
                                    fontFamily: fontFamilies.regular,
                                }}
                                placeholderColor={colors.black4}
                                styles={{ width: sizes.width - 40 }}
                                placeholder="Nhập email để nhận mật khẩu mới"
                                value={email}
                                onChange={setEmail}
                            />
                            <Space height={8} />
                            <Button
                                loading={isLoading}
                                radius={6}
                                textStyleProps={{ fontFamily: fontFamilies.medium }}
                                color={colors.blue}
                                styles={{ width: sizes.width - 40 }}
                                title="Gửi link đổi mật khẩu"
                                onPress={handleForgotPassword}
                            />
                            <Space height={4} />
                            <TextComponent
                                color={colors.black}
                                styles={{ textAlign: 'center' }}
                                text="Đảm bảo nhập đúng email để lấy lại mật khẩu bạn nhé"
                            />
                            <Space height={16} />
                            <Row styles={{ width: '100%' }} justifyContent="flex-end">
                                <Button
                                    radius={6}
                                    textStyleProps={{ fontFamily: fontFamilies.medium }}
                                    color={colors.red}
                                    title="Đăng nhập ngay"
                                    onPress={() => navigation.navigate('Login')}
                                />
                            </Row>
                        </Row>
                    </Row>
                </Section>
            </View>
        </Container >
    );
};

export default ForgotPassword;