import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Song } from '../../constants/models';
import Container from '../../components/Container';
import TextComponent from '../../components/TextComponent';
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View } from 'react-native';
import { sizes } from '../../constants/sizes';
import { Section } from '@bsdaoquang/rncomponent';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import Icon from 'react-native-vector-icons/Ionicons';

const Favorite = ({ navigation }: any) => {
    const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = auth().currentUser?.uid;
        if (!userId) {
            console.log("Người dùng chưa đăng nhập");
            return;
        }

        const userFavoriteRef = firestore().collection('favorite').doc(userId);

        // Lắng nghe thay đổi từ Firestore (Realtime listener)
        const unsubscribe = userFavoriteRef.onSnapshot((userfavoriteDoc) => {
            setLoading(true); // Hiển thị loading trong khi đang tải
            if (userfavoriteDoc.exists) {
                const favoriteData = userfavoriteDoc.data();
                if (favoriteData) {
                    const songs = Object.keys(favoriteData || {}).map((key) => ({
                        id: key,
                        ...favoriteData[key]
                    }));
                    setFavoriteSongs(songs); // Cập nhật danh sách bài hát yêu thích
                }
            } else {
                console.log("Thư viện rỗng");
                setFavoriteSongs([]); // Trường hợp không có dữ liệu
            }
            setLoading(false); // Ẩn loading khi đã có dữ liệu
        });

        // Cleanup listener khi component unmount
        return () => unsubscribe();
    }, []);

    // Hàm xóa bài hát khỏi yêu thích
    const removeFromFavorites = async (songId: string) => {
        try {
            const userId = auth().currentUser?.uid;
            if (!userId) {
                console.log("Người dùng chưa đăng nhập");
                return;
            }

            const userFavoriteRef = firestore().collection('favorite').doc(userId);
            await userFavoriteRef.update({
                [songId]: firestore.FieldValue.delete(), // Xóa bài hát khỏi danh sách yêu thích
            });
            console.log('Bài hát đã được xóa khỏi thư viện yêu thích');
        } catch (error) {
            console.log('Lỗi khi xóa bài hát khỏi thư viện yêu thích:', error);
        }
    };

    const renderSong = ({ item }: { item: Song }) => (
        <Section>
            <TouchableOpacity onPress={() => navigation.navigate('MusicDetail', { song: item, playlist: favoriteSongs })} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                    source={{ uri: item.image }}
                    style={{ width: 50, height: 50, borderRadius: 5, marginRight: 10 }}
                />
                <Section styles={{ flex: 1 }}>
                    <TextComponent
                        text={item.name}
                        color={colors.black}
                        font={fontFamilies.semiBold}
                    />
                    <TextComponent
                        text={item.artists}
                        color={colors.black4}
                        font={fontFamilies.regular}
                    />
                </Section>
                <TouchableOpacity onPress={() => removeFromFavorites(item.id)}>
                    <Icon
                        name="heart"
                        size={sizes.icon}
                        color={colors.red}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Section>
    );

    return (
        <Container isScroll={false} style={{ backgroundColor: colors.white, flex: 1 }}>
            <FlatList
                data={favoriteSongs}
                renderItem={renderSong}
                keyExtractor={item => item.id}
                nestedScrollEnabled={true}
                onEndReachedThreshold={1}
                ListFooterComponent={loading ? <ActivityIndicator size="large" color={colors.black} /> : null}
            />
        </Container>
    );
}

export default Favorite;
