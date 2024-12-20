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
import Toast, { SuccessToast } from 'react-native-toast-message';
const MusicList = ({ navigation }: any) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);
  const [loadCount, setLoadCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [marqueeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      const fetchedSongs = await getMusicListByKeyword('vietnamese pop');

      if (fetchedSongs && Array.isArray(fetchedSongs)) {
        const validSongs = fetchedSongs.filter((song: Song) => song.videoUrl);
        setSongs(validSongs);
        setDisplayedSongs(validSongs.slice(0, loadCount));
      }
      setLoading(false);
    };

    fetchSongs();
  }, []);

  const loadMoreSongs = () => {
    if (loading) return;
    setLoading(true);
    const newLoadCount = loadCount + 10;
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
      const userfavoriteDoc = await userfavoriteRef.get();

      let isFavorite = false;

      if (userfavoriteDoc.exists) {
        const favoriteData = userfavoriteDoc.data();
        if (favoriteData && favoriteData[songId]) {
          console.log('Bài hát đã tồn tại trong thư viện');
          isFavorite = true;
        }
      }

      if (isFavorite) {
        await userfavoriteRef.update({
          [songId]: firestore.FieldValue.delete(),
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
              genres: song.genres
            },
          },
          { merge: true },
        );
        console.log(song.genres);
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
      console.log('Lỗi khi lưu bài hát đã nghe gần đây');
    }
  };

  const renderSong = ({ item }: { item: Song }) => (
    <Section>
      <TouchableOpacity
        onPress={() => {
          saveRecentlyPlayed(item);
          console.log("videoid: ", item);
          navigation.navigate('MusicDetail', { song: item, playlist: songs });
        }}
        style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 90, position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
          <Image
            source={{ uri: item.image }}
            resizeMode='cover'
            style={{ width: 145, height: 80, borderRadius: 5, marginRight: 5 }}
          />
        </View>
        <Section
          styles={{
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
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
            <Icon
              name="ellipsis-vertical"
              size={sizes.icon}
              color={colors.black}
            />
          </MenuTrigger>
          <MenuOptions >
            <MenuOption style={{ padding: 8, borderBottomColor: colors.black2, borderBottomWidth: 1 }} onSelect={() => { navigation.navigate('ShowPlaylist', { selectedSong: item }); }}>
              <TextComponent text="Thêm vào danh sách" />
            </MenuOption>
            <MenuOption style={{ padding: 8 }} onSelect={() => { saveTofavorite(item); console.log(item) }}>
              <TextComponent text="Yêu thích bài hát" />
            </MenuOption>
          </MenuOptions>
        </Menu>
      </TouchableOpacity>
    </Section>
  );

  return (
    <MenuProvider>
      <Container
        isScroll={true}
        style={{ backgroundColor: colors.white, flex: 1 }}>
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
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
            }}
          />

          <TextComponent
            text="Danh sách nhạc"
            color={colors.white}
            font={fontFamilies.bold}
            size={sizes.title}
          />

          {/* Nút tìm kiếm */}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Icon name="search" size={sizes.icon} color={colors.white} />
            </TouchableOpacity>
            <Space width={30} />
            <TouchableOpacity onPress={() => console.log('mic')}>
              <FontAwesome
                name="microphone"
                size={sizes.icon}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        </Section>

        {/* Danh sách bài hát */}
        <Space height={10} />
        <FlatList
          data={displayedSongs}
          renderItem={renderSong}
          keyExtractor={item => item.name}
          nestedScrollEnabled={true}
          onEndReached={loadMoreSongs}
          onEndReachedThreshold={0.1}
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
