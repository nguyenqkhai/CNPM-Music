import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  MenuProvider,
} from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../constants/colors';
import TextComponent from '../../components/TextComponent';
import { sizes } from '../../constants/sizes';
import { fontFamilies } from '../../constants/fontFamilies';
import Container from '../../components/Container';
import auth from '@react-native-firebase/auth';
import { Song } from '../../constants/models';
import firestore from '@react-native-firebase/firestore';
import { Section, Space } from '@bsdaoquang/rncomponent';
import { getMusicListByKeyword } from '../../utils/handleAPI';

const MusicList = ({ navigation }: any) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);
  const [loadCount, setLoadCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      const fetchedSongs = await getMusicListByKeyword('vietnamese vpop');

      if (fetchedSongs && Array.isArray(fetchedSongs)) {
        const validSongs = fetchedSongs.filter((song) => song.videoUrl);
        setSongs(validSongs);
        setDisplayedSongs(validSongs.slice(0, loadCount));
      }
      setLoading(false);
    };

    const fetchFavorites = async () => {
      try {
        const userId = auth().currentUser?.uid;
        if (!userId) return;

        const userFavoriteRef = firestore().collection('favorite').doc(userId);
        const userFavoriteDoc = await userFavoriteRef.get();

        if (userFavoriteDoc.exists) {
          const favoriteData = userFavoriteDoc.data();
          if (favoriteData) {
            setFavoriteIds(new Set(Object.keys(favoriteData)));
          }
        }
      } catch (error) {
        console.log('Lỗi khi lấy danh sách yêu thích:', error);
      }
    };

    fetchSongs();
    fetchFavorites();
  }, []);

  const loadMoreSongs = () => {
    if (loading) return;
    setLoading(true);
    const newLoadCount = loadCount + 100;
    setDisplayedSongs(songs.slice(0, newLoadCount));
    setLoadCount(newLoadCount);
    setLoading(false);
  };

  const saveTofavorite = async (song: Song) => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        console.log('Người dùng chưa đăng nhập');
        return;
      }

      const songId = String(song.id);
      const userfavoriteRef = firestore().collection('favorite').doc(userId);
      const isFavorite = favoriteIds.has(songId);

      if (isFavorite) {
        await userfavoriteRef.update({
          [songId]: firestore.FieldValue.delete(),
        });
        setFavoriteIds((prev) => {
          const updated = new Set(prev);
          updated.delete(songId);
          return updated;
        });
        console.log('Đã xóa bài hát khỏi thư viện');
      } else {
        await userfavoriteRef.set(
          {
            [songId]: {
              id: song.id,
              name: song.name,
              artists: song.artists,
              image: song.image,
              videoUrl: song.videoUrl,
              genres: song.genres,
            },
          },
          { merge: true },
        );
        setFavoriteIds((prev) => new Set(prev).add(songId));
        console.log('Đã thêm bài hát vào thư viện');
      }
    } catch (error) {
      console.log('Lỗi khi lưu bài hát:', error);
    }
  };

  const saveRecentlyPlayed = async (song: Song) => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        console.log('Người dùng chưa đăng nhập');
        return;
      }

      const songId = String(song.id);
      const userRef = firestore().collection('recently list').doc(userId);
      await userRef.set(
        {
          [songId]: {
            id: song.id,
            name: song.name,
            artists: song.artists,
            image: song.image,
            videoUrl: song.videoUrl,
            genres: song.genres,
          },
        },
        { merge: true },
      );
    } catch (error) {
      console.log('Lỗi khi lưu bài hát đã nghe gần đây:', error);
    }
  };

  const renderSong = ({ item }: any) => {
    const isFavorite = favoriteIds.has(String(item.id));

    return (
      <Section>
        <TouchableOpacity
          onPress={() => {
            saveRecentlyPlayed(item);
            navigation.navigate('MusicDetail', { song: item, playlist: songs });
          }}
          style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 90, overflow: 'hidden', borderRadius: 4 }}>
            <Image
              source={{ uri: item.image }}
              resizeMode="cover"
              style={{ width: 145, height: 80, borderRadius: 5, marginRight: 5 }}
            />
          </View>
          <Section styles={{ flexDirection: 'column', justifyContent: 'center' }}>
            <Animated.Text
              style={{
                fontFamily: fontFamilies.semiBold,
                width: 250,
                fontSize: sizes.text,
                overflow: 'hidden',
              }}
              numberOfLines={1}
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
          </Section>

          <Menu>
            <MenuTrigger>
              <Icon name="ellipsis-vertical" size={sizes.icon} color={colors.black} />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption
                style={{ padding: 8, borderBottomColor: colors.black2, borderBottomWidth: 1 }}
                onSelect={() => navigation.navigate('ShowPlaylist', { selectedSong: item })}>
                <TextComponent text="Thêm vào danh sách" />
              </MenuOption>
              <MenuOption
                style={{ padding: 8 }}
                onSelect={() => saveTofavorite(item)}>
                <TextComponent
                  text={isFavorite ? 'Xóa bài hát khỏi danh sách yêu thích' : 'Yêu thích bài hát'}
                />
              </MenuOption>
            </MenuOptions>
          </Menu>
        </TouchableOpacity>
      </Section>
    );
  };

  return (
    <MenuProvider>
      <Container style={{ backgroundColor: colors.white, flex: 1 }} isScroll={false}>
        {/* Header */}
        <Section
          styles={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 15,
            backgroundColor: colors.instagram,
          }}>
          <Image
            source={{ uri: 'https://example.com/avatar.jpg' }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />

          <TextComponent
            text="Danh sách nhạc"
            color={colors.white}
            font={fontFamilies.bold}
            size={sizes.title}
          />

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Icon name="search" size={sizes.icon} color={colors.white} />
            </TouchableOpacity>
            <Space width={30} />
            <TouchableOpacity onPress={() => console.log('mic')}>
              <FontAwesome name="microphone" size={sizes.icon} color={colors.white} />
            </TouchableOpacity>
          </View>
        </Section>

        {/* Danh sách bài hát */}
        <Space height={10} />
        <FlatList
          data={displayedSongs}
          renderItem={renderSong}
          keyExtractor={(item) => String(item.id)}
          nestedScrollEnabled={true}
          onEndReached={loadMoreSongs}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="large" color={colors.black} />
            ) : null
          }
        />
      </Container>
    </MenuProvider>
  );
};

export default MusicList;
