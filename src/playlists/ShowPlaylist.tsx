import {
    View,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import TextComponent from '../components/TextComponent';
import Container from '../components/Container';
import { colors } from '../constants/colors';
import { fontFamilies } from '../constants/fontFamilies';
import { Section, Space, Text } from '@bsdaoquang/rncomponent';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ShowPlaylist = ({ navigation, route }: any) => {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
    const selectedSong = route.params?.selectedSong;

    const fetchPlaylists = () => {
        const userId = auth().currentUser?.uid;
        if (userId) {
            try {
                const playlistRef = firestore().collection('playlists').doc(userId);
                playlistRef.onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data() || {};
                        const playlists = Object.keys(data).map(playlistId => ({
                            id: playlistId,
                            ...data[playlistId],
                        }));
                        setPlaylists(playlists);
                    }
                });
            } catch (error) {
                console.log('Lỗi khi tải playlist: ', error);
            }
        }
    };

    const addSongToSelectedPlaylists = async () => {
        try {
            const userId = auth().currentUser?.uid;
            if (!userId || !selectedSong) {
                console.log('Dữ liệu bài hát không được truyền sang.');
                return;
            }

            const playlistRef = firestore().collection('playlists').doc(userId);

            const updates: Record<string, any> = {};
            selectedPlaylists.forEach(playlistId => {
                updates[`${playlistId}.songs`] = firestore.FieldValue.arrayUnion(selectedSong);
            });

            await playlistRef.update(updates);

            Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Bài hát đã được thêm vào các playlist',
            });
            setSelectedPlaylists(new Set());
        } catch (error) {
            console.log('Lỗi khi thêm bài hát vào playlist:', error);
        }
    };

    const toggleSelectPlaylist = (playlistId: string) => {
        setSelectedPlaylists(prev => {
            const updated = new Set(prev);
            if (updated.has(playlistId)) {
                updated.delete(playlistId);
            } else {
                updated.add(playlistId);
            }
            return updated;
        });
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const renderPlaylistItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => toggleSelectPlaylist(item.id)}
            style={[
                styles.cardContainer,
                selectedPlaylists.has(item.id) && styles.selectedCard,
            ]}>
            <View style={styles.imageContainer}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                ) : (
                    <View style={styles.placeholderImage} />
                )}
            </View>
            <View style={styles.details}>
                <TextComponent
                    text={item.name}
                    font={fontFamilies.semiBold}
                    size={20}
                />
                <Space width={10} />
                <TextComponent
                    text={item.auther}
                    font={fontFamilies.regular}
                    size={18}
                    color={colors.black}
                />
            </View>
        </TouchableOpacity>
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
                }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{
                    position: 'absolute',
                    left: 0,
                    padding: 15,
                }}>
                    <Ionicons
                        name="chevron-back"
                        size={40}
                        color={colors.black}
                    />
                </TouchableOpacity>

                <TextComponent
                    text="Danh sách playlist"
                    color={colors.white}
                    font={fontFamilies.bold}
                    size={20}
                />
            </Section>
            <FlatList
                data={playlists}
                keyExtractor={item => item.id}
                renderItem={renderPlaylistItem}
                contentContainerStyle={styles.list}
            />
            <Section
                styles={{
                    backgroundColor: 'coral',
                    borderRadius: 40,
                    paddingVertical: 15,
                    bottom: 2,
                    paddingHorizontal: 30
                }}>
                <TouchableOpacity
                    onPress={addSongToSelectedPlaylists}
                    style={{
                        alignSelf: 'center'
                    }}
                >
                    <TextComponent
                        text="Thêm vào danh sách"
                        size={20}
                        font={fontFamilies.semiBold}
                        color={colors.white}
                    />
                </TouchableOpacity>
            </Section>

        </Container>
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    cardContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: colors.white,
        borderRadius: 10,
        borderBottomColor: colors.grey,
        borderBottomWidth: 1,
        paddingBottom: 20
    },
    selectedCard: {
        backgroundColor: colors.grey,
    },
    imageContainer: {
        borderRadius: 10,
        backgroundColor: colors.white,
    },
    image: {
        height: 100,
        width: 100,
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: colors.grey,
    },
    details: {
        flex: 1,
        marginLeft: 10,
    },
});

export default ShowPlaylist;
