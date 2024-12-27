import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Song } from '../../constants/models';
import Container from '../../components/Container';
import TextComponent from '../../components/TextComponent';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Section, Space } from '@bsdaoquang/rncomponent';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import Icon from 'react-native-vector-icons/Ionicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

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

        const unsubscribe = userFavoriteRef.onSnapshot((userfavoriteDoc) => {
            setLoading(true);
            if (userfavoriteDoc.exists) {
                const favoriteData = userfavoriteDoc.data();
                if (favoriteData) {
                    const songs = Object.keys(favoriteData || {}).map((key) => ({
                        id: key,
                        ...favoriteData[key]
                    }));
                    setFavoriteSongs(songs);
                }
            } else {
                setFavoriteSongs([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const removeFromFavorites = async (songId: string) => {
        try {
            const userId = auth().currentUser?.uid;
            if (!userId) {
                console.log("Người dùng chưa đăng nhập");
                return;
            }

            const userFavoriteRef = firestore().collection('favorite').doc(userId);
            await userFavoriteRef.update({
                [songId]: firestore.FieldValue.delete(),
            });
        } catch (error) {
            console.log('Lỗi khi xóa bài hát khỏi thư viện yêu thích:', error);
        }
    };

    const renderSong = ({ item }: { item: Song }) => (
        <Section>
            <TouchableOpacity onPress={() => { navigation.navigate('MusicDetail', { song: item, playlist: favoriteSongs }) }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                    source={{ uri: item.image }}
                    style={{ width: 145, height: 80, borderRadius: 5, marginRight: 10 }}
                />
                <Section styles={{ flex: 1, justifyContent: 'center', alignSelf: 'center' }}>
                    <View style={styles.songInfo}>
                        <TextComponent text={item.name} numberOfLines={2} styles={[styles.songName, { maxWidth: 180 }]} />
                        <TextComponent text={item.artists} styles={styles.songArtist} />
                    </View>
                </Section>
                <TouchableOpacity onPress={() => removeFromFavorites(item.id)}>
                    <Icon
                        name="heart"
                        size={24}
                        color={colors.red}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Section>
    );

    return (
        <Container isScroll={false} style={{ backgroundColor: colors.white, flex: 1 }}>
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
                    text="Bài hát yêu thích"
                    font={fontFamilies.bold}
                    size={25}
                    color={colors.white}
                />
            </Section>
            <Space height={10} />
            {favoriteSongs.length === 0 ? (
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
                    data={favoriteSongs}
                    renderItem={renderSong}
                    keyExtractor={item => item.id}
                    nestedScrollEnabled={true}
                    onEndReachedThreshold={1}
                    ListFooterComponent={loading ? <ActivityIndicator size="large" color={colors.black} /> : null}
                />
            )}

        </Container>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    header: { alignItems: 'center', padding: 20, paddingBottom: 2 },
    playlistImage: { width: 200, height: 200, borderRadius: 10 },
    playlistInfo: { alignItems: 'center', marginVertical: 10 },
    playlistName: {
        fontSize: 28,
        fontFamily: fontFamilies.bold,
        color: colors.black,
    },
    playlistDetails: { fontSize: 14, color: colors.black },
    shuffleButton: {
        backgroundColor: colors.instagram,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 50,
        marginTop: 10,
        top: -8,
        left: -5
    },
    shuffleText: {
        color: colors.white,
        fontSize: 16,
        fontFamily: fontFamilies.bold,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    songImage: { width: 145, height: 80, borderRadius: 4 },
    songInfo: { flex: 1 },
    songName: { fontSize: 16, fontFamily: fontFamilies.semiBold },
    songArtist: { fontSize: 14, color: colors.black, fontFamily: fontFamilies.regular },
});

export default Favorite;
