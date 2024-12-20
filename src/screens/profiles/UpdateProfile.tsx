import { Row, Section, Space } from '@bsdaoquang/rncomponent';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Container from '../../components/Container';
import TextComponent from '../../components/TextComponent'
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';
import React from 'react';
import { parseDateTime } from '../../utils/helper';

interface UserProps {
    displayName: string;
    email: string;
    emailVerified: boolean;
    phoneNumber?: string;
    gender?: string;
    birthday?: string;
    photoUrl?: string;
}

interface Params {
    infor?: string;
    title?: string;
    userId?: string;
    userData?: UserProps;
}

const UpdateProfile = ({ navigation }: any) => {
    const [userData, setUserData] = useState<UserProps>();
    const [isExpanded, setIsExpanded] = useState(false);
    const [open, setOpen] = useState(false);

    const user: any = auth().currentUser;
    const userId = auth().currentUser?.uid;

    const handleCheckUser = () => {
        firestore()
            .collection('users')
            .doc(userId)
            .onSnapshot((item: any) => {
                const existingUser = item.data() || {};
                setUserData(existingUser);
            });
    };

    const handleUpdateGender = async (value: string) => {
        if (!userData || Object.keys(userData).length === 0) {
            try {
                const data = {
                    email: user.email ?? '',
                    displayName: user.displayName ?? '',
                    emailVerified: user.emailVerified,
                    photoUrl: user.photoURL,
                    creationTime: user.metadata.creationTime,
                    lastSignInTime: user.metadata.lastSignInTime,
                };

                await firestore().collection('users').doc(userId).set(data);

                console.log('User created');
            } catch (error) {
                console.log(error);
            }
        }

        try {
            await firestore().collection('users').doc(userId).update({ gender: value });

            setIsExpanded(false);
            Toast.show({
                type: 'success',
                text1: 'Thông báo',
                text2: 'Cập nhật giới tính thành công',
            });
        } catch (error) {
            console.log(error);
            setIsExpanded(false);
            Toast.show({
                type: 'error',
                text1: 'Thông báo',
                text2: 'Cập nhật giới tính thất bại',
            });
        }
    };

    const handlePassword = async (url: string, params: Params) => {
        if (!userData || Object.keys(userData).length === 0) {
            try {
                const data = {
                    email: user.email ?? '',
                    displayName: user.displayName ?? '',
                    emailVerified: user.emailVerified,
                    photoUrl: user.photoURL,
                    creationTime: user.metadata.creationTime,
                    lastSignInTime: user.metadata.lastSignInTime,
                };

                await firestore().collection('users').doc(userId).set(data);

                console.log('User created');
            } catch (error) {
                console.log(error);
            }
        }

        navigation.navigate(url, params);
    };

    const handleUpdateBirthday = async (date: string) => {
        if (!userData || Object.keys(userData).length === 0) {
            try {
                const data = {
                    email: user.email ?? '',
                    displayName: user.displayName ?? '',
                    emailVerified: user.emailVerified,
                    photoUrl: user.photoURL,
                    creationTime: user.metadata.creationTime,
                    lastSignInTime: user.metadata.lastSignInTime,
                };

                await firestore().collection('users').doc(userId).set(data);

                console.log('User created');
            } catch (error) {
                console.log(error);
            }
        }

        try {
            await firestore()
                .collection('users')
                .doc(userId)
                .update({ birthday: date });

            setOpen(false);
            Toast.show({
                type: 'success',
                text1: 'Thông báo',
                text2: 'Cập nhật ngày sinh thành công',
            });
        } catch (error) {
            console.log(error);
            setOpen(false);
            Toast.show({
                type: 'error',
                text1: 'Thông báo',
                text2: 'Cập nhật ngày sinh thất bại',
            });
        }
    };

    useEffect(() => {
        handleCheckUser();
    }, []);

    return (
        <Container
            title="Cập nhật thông tin"
            back={
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color={colors.white} />
                </TouchableOpacity>
            }
            style={{ backgroundColor: colors.black }}>
            <Section styles={{ paddingVertical: 4, marginTop: 12 }}>
                <TextComponent
                    styles={{
                        borderBottomWidth: 1,
                        borderBottomColor: colors.black4,
                        paddingBottom: 8,
                    }}
                    text="Thông tin tài khoản"
                    color={colors.grey2}
                    size={sizes.bigTitle}
                />
                <Space height={16} />
                <Row styles={{ flexDirection: 'column' }}>
                    <Row styles={{ width: '100%' }} justifyContent="space-between">
                        <Row>
                            <MaterialIcons
                                name="drive-file-rename-outline"
                                size={sizes.icon}
                                color={colors.white}
                            />
                            <Space width={8} />
                            <TextComponent
                                text="Tên người dùng"
                                size={sizes.bigTitle}
                                color={colors.white}
                            />
                        </Row>

                        <TouchableOpacity
                            onPress={() =>
                                handlePassword('UpdateScreen', {
                                    infor: 'displayName',
                                    title: 'tên người dùng',
                                    userId,
                                    userData,
                                })
                            }>
                            <Row>
                                <TextComponent
                                    text={userData?.displayName ?? ''}
                                    color={colors.white}
                                    size={sizes.bigTitle}
                                />
                                <Space width={4} />
                                <Entypo
                                    name="chevron-right"
                                    size={sizes.icon}
                                    color={colors.yellow3}
                                />
                            </Row>
                        </TouchableOpacity>
                    </Row>

                    <Space height={12} />

                    <Row styles={{ width: '100%' }} justifyContent="space-between">
                        <Row>
                            <MaterialCommunityIcons
                                name="email"
                                size={sizes.icon}
                                color={colors.white}
                            />
                            <Space width={8} />
                            <TextComponent
                                text="Email"
                                size={sizes.bigTitle}
                                color={colors.white}
                            />
                        </Row>
                        <TextComponent
                            text={user?.email ?? ''}
                            color={colors.white}
                            size={sizes.bigTitle}
                        />
                    </Row>

                    <Space height={12} />

                    {userData?.photoUrl ? (
                        <></>
                    ) : (
                        <>
                            <Row styles={{ width: '100%' }} justifyContent="space-between">
                                <Row>
                                    <MaterialIcons
                                        name="password"
                                        size={sizes.icon}
                                        color={colors.white}
                                    />
                                    <Space width={8} />
                                    <TextComponent
                                        text="Mật khẩu"
                                        size={sizes.bigTitle}
                                        color={colors.white}
                                    />
                                </Row>
                                <TouchableOpacity
                                    onPress={() => handlePassword('PasswordScreen', {})}>
                                    <Row>
                                        <TextComponent
                                            text="Cập nhật"
                                            color={colors.yellow3}
                                            size={sizes.bigTitle}
                                        />
                                        <Space width={4} />
                                        <Entypo
                                            name="chevron-right"
                                            size={sizes.icon}
                                            color={colors.yellow3}
                                        />
                                    </Row>
                                </TouchableOpacity>
                            </Row>
                            <Space height={12} />
                        </>
                    )}

                    <Row styles={{ width: '100%' }} justifyContent="space-between">
                        <Row>
                            <FontAwesome
                                name="phone"
                                size={sizes.icon}
                                color={colors.white}
                            />
                            <Space width={8} />
                            <TextComponent
                                text="Số điện thoại"
                                size={sizes.bigTitle}
                                color={colors.white}
                            />
                        </Row>
                        <TouchableOpacity
                            onPress={() =>
                                handlePassword('UpdateScreen', {
                                    infor: 'phoneNumber',
                                    title: 'Số điện thoại',
                                    userId,
                                    userData,
                                })
                            }>
                            <Row>
                                <TextComponent
                                    text={userData?.phoneNumber ?? 'Cập nhật'}
                                    color={userData?.phoneNumber ? colors.white : colors.yellow3}
                                    size={sizes.bigTitle}
                                />
                                <Space width={4} />
                                <Entypo
                                    name="chevron-right"
                                    size={sizes.icon}
                                    color={colors.yellow3}
                                />
                            </Row>
                        </TouchableOpacity>
                    </Row>

                    <Space height={12} />

                    <Row styles={{ width: '100%' }} justifyContent="space-between">
                        <Row>
                            <MaterialCommunityIcons
                                name="gender-male-female"
                                size={sizes.icon}
                                color={colors.white}
                            />
                            <Space width={8} />
                            <TextComponent
                                text="Giới tính"
                                size={sizes.bigTitle}
                                color={colors.white}
                            />
                        </Row>
                        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                            <Row>
                                <TextComponent
                                    text={userData?.gender ?? 'Cập nhật'}
                                    color={userData?.gender ? colors.white : colors.yellow3}
                                    size={sizes.bigTitle}
                                />
                                <Space width={4} />
                                <Entypo
                                    name="chevron-right"
                                    size={sizes.icon}
                                    color={colors.yellow3}
                                />
                            </Row>

                            {isExpanded && (
                                <Row
                                    styles={{
                                        flexDirection: 'column',
                                        position: 'absolute',
                                        paddingHorizontal: 2,
                                        paddingVertical: 4,
                                        bottom: -110,
                                        right: 0,
                                        zIndex: 1000,
                                        width: 110,
                                        backgroundColor: colors.black2,
                                    }}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => handleUpdateGender('Nam')}>
                                        <TextComponent text="Nam" color={colors.white} />
                                    </TouchableOpacity>
                                    <View
                                        style={{
                                            width: 110,
                                            height: 2,
                                            backgroundColor: colors.grey4,
                                            marginVertical: 4,
                                        }}
                                    />
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => handleUpdateGender('Nữ')}>
                                        <TextComponent text="Nữ" color={colors.white} />
                                    </TouchableOpacity>
                                    <View
                                        style={{
                                            width: 110,
                                            height: 2,
                                            backgroundColor: colors.grey4,
                                            marginVertical: 4,
                                        }}
                                    />
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => handleUpdateGender('Không tiết lộ')}>
                                        <TextComponent text="Không tiết lộ" color={colors.white} />
                                    </TouchableOpacity>
                                    <View
                                        style={{
                                            width: 110,
                                            height: 2,
                                            marginTop: 4,
                                        }}
                                    />
                                </Row>
                            )}
                        </TouchableOpacity>
                    </Row>

                    <Space height={12} />

                    <Row styles={{ width: '100%' }} justifyContent="space-between">
                        <Row>
                            <FontAwesome
                                name="birthday-cake"
                                size={sizes.icon}
                                color={colors.white}
                            />
                            <Space width={8} />
                            <TextComponent
                                text="Ngày sinh"
                                size={sizes.bigTitle}
                                color={colors.white}
                            />
                        </Row>
                        <TouchableOpacity
                            style={{ zIndex: -1 }}
                            onPress={() => setOpen(true)}>
                            <Row>
                                <TextComponent
                                    text={userData?.birthday ?? 'Cập nhật'}
                                    color={userData?.birthday ? colors.white : colors.yellow3}
                                    size={sizes.bigTitle}
                                />
                                <Space width={4} />
                                <Entypo
                                    name="chevron-right"
                                    size={sizes.icon}
                                    color={colors.yellow3}
                                />
                            </Row>
                        </TouchableOpacity>
                        <DatePicker
                            modal
                            title="Chọn ngày"
                            confirmText="Cập nhật"
                            cancelText="Thoát"
                            mode="date"
                            open={open}
                            date={new Date()}
                            onConfirm={date => {
                                setOpen(false);
                                const { formattedDate } = parseDateTime(date.toString());
                                handleUpdateBirthday(formattedDate);
                            }}
                            onCancel={() => {
                                setOpen(false);
                            }}
                        />
                    </Row>
                </Row>
            </Section>

            <Space height={30} />

            <Section styles={{ paddingVertical: 4 }}>
                <TextComponent
                    styles={{
                        borderBottomWidth: 1,
                        borderBottomColor: colors.black4,
                        paddingBottom: 8,
                    }}
                    text="Tài khoản liên kết"
                    color={colors.grey2}
                    size={sizes.bigTitle}
                />
                <Space height={16} />
                <Row styles={{ flexDirection: 'column' }}>
                    <Row styles={{ width: '100%' }} justifyContent="space-between">
                        <Row>
                            <FontAwesome
                                name="google-plus-official"
                                size={sizes.icon}
                                color={colors.googleRed}
                            />
                            <Space width={8} />
                            <TextComponent
                                text="Google"
                                size={sizes.bigTitle}
                                color={colors.white}
                            />
                        </Row>
                        <TextComponent
                            text={user?.emailVerified ? 'Đã liên kết' : 'Chưa liên kết'}
                            color={colors.white}
                            size={sizes.bigTitle}
                        />
                    </Row>
                </Row>
            </Section>
        </Container>
    );
};

export default UpdateProfile;