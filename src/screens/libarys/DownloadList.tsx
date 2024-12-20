import React, { useEffect, useState } from 'react';
import {
    FlatList,
    PermissionsAndroid,
    Platform,
    TouchableOpacity,
    View,
    Text,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Container from '../../components/Container';
import TextComponent from '../../components/TextComponent';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import { Section, Space } from '@bsdaoquang/rncomponent';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import { sizes } from '../../constants/sizes';
import Feather from 'react-native-vector-icons/Feather';

const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
        const version = Platform.Version;

        if (version >= 30) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: 'Yêu cầu quyền truy cập bộ nhớ',
                    message: 'Ứng dụng cần quyền để truy cập bài hát từ thiết bị',
                    buttonPositive: 'Đồng ý',
                    buttonNegative: 'Hủy',
                },
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Quyền truy cập bị từ chối', 'Hãy cấp quyền để tiếp tục.');
                return false;
            }
        } else {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ]);

            if (
                granted['android.permission.READ_EXTERNAL_STORAGE'] !==
                PermissionsAndroid.RESULTS.GRANTED ||
                granted['android.permission.WRITE_EXTERNAL_STORAGE'] !==
                PermissionsAndroid.RESULTS.GRANTED
            ) {
                Alert.alert('Quyền truy cập bị từ chối', 'Hãy cấp quyền để tiếp tục.');
                return false;
            }
        }
        return true;
    }
    return true;
};

const DownloadList = ({ navigation }: any) => {
    const [songs, setSongs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSongs = async () => {
        try {
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                setLoading(false);
                return;
            }
            const downloadPath = RNFS.DownloadDirectoryPath;
            const files = await RNFS.readDir(downloadPath);

            const songFiles = files.filter(file => file.name.endsWith('.mp4'));
            setSongs(songFiles.map(file => file.name));
        } catch (error) {
            console.error('Lỗi khi tải danh sách bài hát:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSongs();
    }, []);

    const renderSongItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={{
                padding: 15,
                marginVertical: 5,
                marginHorizontal: 10,
                backgroundColor: colors.grey,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Feather name="music" size={24} color={colors.red} />
            <TextComponent text={item} size={16} color={colors.red} />
        </TouchableOpacity>
    );

    return (
        <Container style={{ backgroundColor: colors.white, flex: 1 }}>
            <Section
                styles={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 15,
                    backgroundColor: colors.instagram,
                }}
            >
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        left: 0,
                        padding: 15,
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={30} color={colors.white} />
                </TouchableOpacity>
                <TextComponent
                    text="Bài hát tải về"
                    font={fontFamilies.bold}
                    size={25}
                    color={colors.white}
                />
            </Section>
            {loading ? (
                <ActivityIndicator size="large" color={colors.instagram} style={{ marginTop: 20 }} />
            ) : songs.length === 0 ? (
                <Section styles={{ alignItems: 'center', marginTop: 50 }}>
                    <Space height={200} />
                    <Feather name="music" size={100} color={colors.lightGray} />
                    <TextComponent
                        text="Không có bài hát được tải về"
                        font={fontFamilies.regular}
                        size={18}
                        color={colors.black2}
                        styles={{ marginTop: 10 }}
                    />
                </Section>
            ) : (
                <FlatList
                    data={songs}
                    renderItem={renderSongItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </Container>
    );
};

export default DownloadList;
