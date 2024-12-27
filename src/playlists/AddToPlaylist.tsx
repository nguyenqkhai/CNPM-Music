import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Animated, FlatList, Image, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Input, Row, Section, Space } from '@bsdaoquang/rncomponent';
import TextComponent from '../components/TextComponent';
import Container from '../components/Container';
import { getMusicListByKeyword } from '../utils/handleAPI';
import { colors } from '../constants/colors';
import { fontFamilies } from '../constants/fontFamilies';
import { sizes } from '../constants/sizes';
import { Song } from '../constants/models';
import Toast from 'react-native-toast-message';

const AddToPlaylist = ({ route, navigation }: any) => {
  const { playlist } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [playlistData, setPlaylistData] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  const fetchSuggestedSongs = useCallback(async () => {
    setLoading(true);
    try {
      const items: Song[] = (await getMusicListByKeyword('music')) || [];
      setSuggestedSongs(items);
    } catch (error) {
      console.error('Lỗi khi lấy bài hát gợi ý:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearchResults = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const items: Song[] = (await getMusicListByKeyword(query)) || [];
      setSearchResults(items);
    } catch (error) {
      console.error('Lỗi khi lấy kết quả bài hát:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery);
    } else {
      setSearchResults([]);
      fetchSuggestedSongs();
    }
  }, [searchQuery, fetchSearchResults, fetchSuggestedSongs, fetchPlaylists]);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    const playlistId = playlist?.id;

    if (!userId || !playlistId) return;

    const playlistRef = firestore().collection('playlists').doc(userId);

    const unsubscribe = playlistRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data && data[playlistId]) {
          const songs = data[playlistId]?.songs || [];
          setPlaylistData(songs);
        }
      } else {
        setPlaylistData([]);
      }
    });

    return () => unsubscribe();
  }, [playlist]);

  const addToPlaylist = async (song: Song) => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
        return;
      }

      const playlistId = playlist.id;
      if (!playlistId) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Playlist không hợp lệ'
        })
        return;
      }

      const playlistRef = firestore().collection('playlists').doc(userId);
      const userPlaylistsDoc = await playlistRef.get();
      const userPlaylists = userPlaylistsDoc.data();

      if (!userPlaylists || !userPlaylists[playlistId]) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy playlist.'
        })
        return;
      }

      const existingSongs = userPlaylists[playlistId]?.songs || [];
      const isSongExist = existingSongs.some((s: Song) => s.id === song.id);
      if (isSongExist) {
        Toast.show({
          type: 'info',
          text1: 'Thông báo',
          text2: 'Bài hát đã có trong playlist.',
        });
        return;
      }

      const updatedSongs = [...existingSongs, song];

      await playlistRef.set(
        {
          [playlistId]: {
            ...userPlaylists[playlistId],
            songs: updatedSongs,
          },
        },
        { merge: true }
      );

      Toast.show({
        type: 'success',
        text1: 'Thành công!',
        text2: 'Đã thêm bài hát vào playlist.',
      });
    } catch (error) {
      console.error('Lỗi khi thêm bài hát vào playlist:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể thêm bài hát vào playlist.',
      });
    }
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <Row
      justifyContent="space-between"
      styles={{
        paddingVertical: 12,
        borderBottomColor: colors.black,
        borderBottomWidth: 0.5,
      }}
    >
      <Row >
        <Image source={{ uri: item.image }} style={{ width: 100, height: 80, borderRadius: 4 }} />
        <Space width={12} />
        <View>
          <Animated.Text
            style={{
              fontFamily: fontFamilies.semiBold,
              width: 250,
              maxWidth: 230,
              fontSize: sizes.text,
              overflow: 'hidden',
            }}
            numberOfLines={2}
            ellipsizeMode="tail">
            {item.name}
          </Animated.Text>
          <Animated.Text
            style={{
              fontFamily: fontFamilies.regular,
              width: 250,
              fontSize: sizes.desc,
              overflow: 'hidden',
            }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.artists}
          </Animated.Text>
        </View>
        <TouchableOpacity onPress={() => addToPlaylist(item)}>
          <Ionicons style={{ marginRight: 12, paddingRight: 8 }} color={colors.black} name="add" size={24} />
        </TouchableOpacity>
      </Row>
    </Row>
  );

  return (
    <Container isScroll={false} style={{ backgroundColor: colors.white }}>
      <Section styles={{ marginTop: 45 }}>
        <Row alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              style={{ marginBottom: 10 }}
              name="chevron-back"
              size={24}
              color={colors.black}
            />
          </TouchableOpacity>
          <Input
            prefix={<AntDesign name="search1" size={sizes.title} color={colors.black} />}
            clear
            inputStyles={{ color: colors.black }}
            color={colors.white}
            styles={{ width: 350, paddingVertical: 4 }}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholderColor={colors.black}
            placeholder="Tên bài hát, nghệ sĩ, album"
          />
        </Row>
      </Section>

      <Section>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TextComponent size={sizes.title} color={colors.black} text="Đang tải..." />
          </View>
        ) : searchResults.length > 0 ? (
          <>
            <TextComponent
              font={fontFamilies.semiBold}
              size={sizes.bigTitle}
              color={colors.black}
              text="Kết quả tìm kiếm"
            />
            <Space height={20} />
            <FlatList
              showsVerticalScrollIndicator={false}
              style={{ marginBottom: 200 }}
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSongItem}
            />
          </>
        ) : (
          <>
            <TextComponent
              font={fontFamilies.semiBold}
              size={sizes.bigTitle}
              color={colors.black}
              text="Gợi ý tìm kiếm"
            />
            <Space height={16} />
            <FlatList
              showsVerticalScrollIndicator={false}
              style={{ marginBottom: 200 }}
              data={suggestedSongs}
              keyExtractor={(item) => item.id}
              renderItem={renderSongItem}
            />
          </>
        )}
      </Section>
      <Toast />
    </Container>
  );
};

export default AddToPlaylist;
