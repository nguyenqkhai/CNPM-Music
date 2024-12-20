import { Button, Section, Space } from '@bsdaoquang/rncomponent';
import auth from '@react-native-firebase/auth';
import { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import Input from '../../components/InputComponent';
import Container from '../../components/Container'
const PasswordReset = ({ navigation }: any) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async () => {
        if (!oldPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu cũ');
            return;
        }

        if (!newPassword || !verifyPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu mới và xác nhận');
            return;
        }

        if (newPassword !== verifyPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);
        try {
            const user = auth().currentUser;

            if (!user) {
                throw new Error('Không tìm thấy người dùng');
            }

            const credential = auth.EmailAuthProvider.credential(
                user.email!,
                oldPassword,
            );

            await user.reauthenticateWithCredential(credential);

            await user.updatePassword(newPassword);

            Alert.alert('Thành công', 'Mật khẩu đã được thay đổi');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert(
                'Lỗi',
                error.message || 'Có lỗi xảy ra khi thay đổi mật khẩu',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container
            title="Đổi mật khẩu"
            back={
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color={colors.white} />
                </TouchableOpacity>
            }
            style={{ backgroundColor: colors.black }}>
            <Space height={40} />
            <Section>
                <View>
                    <Input
                        labelStyleProps={{
                            color: colors.white,
                            fontFamily: fontFamilies.medium,
                        }}
                        color={colors.black}
                        inputStyles={{ color: colors.grey }}
                        required
                        password
                        helpText="Hãy nhập mật khẩu cũ"
                        label="Mật khẩu cũ"
                        onChange={setOldPassword}
                        value={oldPassword}
                        placeholder="Vui lòng nhập mật khẩu cũ (*)"
                    />
                    <Input
                        labelStyleProps={{
                            color: colors.white,
                            fontFamily: fontFamilies.medium,
                        }}
                        required
                        password
                        color={colors.black}
                        inputStyles={{ color: colors.grey }}
                        helpText="Hãy nhập mật khẩu mới"
                        label="Mật khẩu mới"
                        onChange={setNewPassword}
                        value={newPassword}
                        placeholder="Vui lòng nhập mật khẩu mới (*)"
                    />
                    <Input
                        labelStyleProps={{
                            color: colors.white,
                            fontFamily: fontFamilies.medium,
                        }}
                        label="Xác nhận mật khẩu"
                        color={colors.black}
                        inputStyles={{ color: colors.grey }}
                        required
                        password
                        helpText={
                            newPassword !== verifyPassword
                                ? 'Mật khẩu nhập lại chưa đúng'
                                : 'Hãy nhập lại mật khẩu mới'
                        }
                        onChange={setVerifyPassword}
                        value={verifyPassword}
                        placeholder="Vui lòng nhập lại mật khẩu mới (*)"
                    />
                    <Space height={40} />
                    <Button
                        radius={6}
                        styles={{ elevation: 0 }}
                        textStyleProps={{ fontFamily: fontFamilies.semiBold }}
                        color={colors.red}
                        title={'Đổi mật khẩu'}
                        onPress={handlePasswordChange}
                        loading={isLoading}
                    />
                </View>
            </Section>
        </Container>
    );
};

export default PasswordReset;