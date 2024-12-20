import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button, Section, Space } from '@bsdaoquang/rncomponent';
import Container from '../../components/Container';
import TextComponent from '../../components/TextComponent';
import { Song } from '../../utils/handleAPI';
import { getMusicListByKeyword } from '../../utils/handleAPI';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import axios from 'axios';
import { RecommnededSong } from '../../constants/models';
import auth from '@react-native-firebase/auth'
import { sizes } from '../../constants/sizes';

const HomeScreen = ({ navigation }: any) => {
    const [categories, setCategories] = useState<{ [key: string]: Song[] }>({
        top100: [],
        kpop: [],
        vpop: [],
    });
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingRecommended, setLoadingRecommended] = useState(false);
    const [recommenSong, setRecommenSong] = useState<RecommnededSong[]>([]);

    useEffect(() => {
        // fetchRecommendedSongs();
        fetchData();
    }, []);
    const userIdd = auth().currentUser?.uid;

    // const fetchRecommendedSongs = useCallback(async () => {
    //     try {
    //         setLoadingRecommended(true);
    //         const response = await axios.post('http://192.168.2.8:5000/recommend_songs',
    //             { userId: userIdd },
    //             { headers: { 'Content-Type': 'application/json' } }
    //         );
    //         setRecommenSong(response.data);
    //         console.log(recommenSong);
    //     } catch (error) {
    //         console.error('Lỗi khi lấy bài hát gợi ý:', error);
    //     } finally {
    //         setLoadingRecommended(false);
    //     }
    // }, []);


    const fetchData = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const [fetchedTop100, fetchedVPop, fetchedKPop] = await Promise.all([
                getMusicListByKeyword('bolero mv'),
                getMusicListByKeyword('vpop'),
                getMusicListByKeyword('Kpop'),
            ]);

            setCategories({
                top100: fetchedTop100 || [],
                vpop: fetchedVPop || [],
                kpop: fetchedKPop || [],
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    const renderSongItem = ({ item, playlist, genre }: { item: Song; playlist: Song[]; genre: string }) => (
        <TouchableOpacity
            onPress={() => {
                navigation.navigate('MusicDetail', { song: item, playlist: playlist });
                console.log(item.genres[0]);
            }}
        >
            <View
                style={{
                    margin: 10,
                    elevation: 2,
                    backgroundColor: colors.white,
                    borderRadius: 10,
                    overflow: 'hidden',
                    paddingBottom: 12,
                    width: 230,
                }}
            >
                <Image source={{ uri: item.image }} style={{ width: 356, height: 200 }} resizeMode="cover" />
                <TextComponent font={fontFamilies.semiBold} text={item.name} size={15} numberOfLines={2} styles={{ paddingHorizontal: 8, paddingTop: 12 }} />
                <Space height={4} />
                <TextComponent text={item.artists} styles={{ paddingHorizontal: 8 }} size={15} font={fontFamilies.bold} />
            </View>
        </TouchableOpacity>
    );

    const renderRecommendedSongs = () => (
        <Section>
            <TextComponent text="Bạn sẽ thích" font={fontFamilies.bold} size={30} />
            <FlatList
                data={recommenSong}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {
                            console.log(`Play song: ${item}`);
                            navigation.navigate('MusicDetail', { song: item, playlist: recommenSong });
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                margin: 10,
                                elevation: 2,
                                backgroundColor: 'coral',
                                borderRadius: 10,
                                overflow: 'hidden',
                                width: 200,

                            }}
                        >
                            <Image source={{ uri: item.image }} style={{ width: 200, height: 200 }} resizeMode="cover" />
                            <TextComponent text={item.name} size={15} numberOfLines={1} />
                            <Space height={8} />
                            <TextComponent text={item.artists} size={12} color={colors.grey} />
                        </View>
                    </TouchableOpacity>
                )}
            />
        </Section>
    );


    const renderCategory = (title: string, data: Song[], genre: string) => (
        <Section styles={{ borderBottomColor: colors.black2, borderBottomWidth: 1, paddingVertical: 8 }}>
            <TextComponent text={title} font={fontFamilies.bold} size={30} />
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }) => renderSongItem({ item, playlist: data, genre })}
            />
        </Section>
    );

    return (
        <Container style={{ backgroundColor: colors.white }}>
            <Section styles={{ paddingHorizontal: 2 }}>
                <Space height={10} />
                <View style={{ paddingVertical: 8 }}>
                    <Button
                        title='Tìm kiếm bài hát'
                        textStyleProps={{ color: colors.black2 }}
                        onPress={() => navigation.navigate('Search')}
                        styles={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            width: sizes.width * 0.9,
                            marginHorizontal: 'auto'
                        }}
                        icon={<Ionicons name="search" size={20} color="black" />}
                    />
                </View>
            </Section>

            {loadingCategories || loadingRecommended ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <>
                    {/* {renderRecommendedSongs()} */}
                    {renderCategory('Bolero', categories.top100, 'Pop Ballad')}
                    {renderCategory('V-Pop', categories.vpop, 'V-Pop')}
                    {renderCategory('K-Pop', categories.kpop, 'K-Pop')}
                </>
            )}
        </Container>
    );
};

export default HomeScreen;
