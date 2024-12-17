import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import TextComponent from '../components/TextComponent';
import { sizes } from '../constants/sizes';
import { fontFamilies } from '../constants/fontFamilies';
import Container from '../components/Container';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Song } from '../constants/models';
import { Section, Space } from '@bsdaoquang/rncomponent';

const PlaylistDetail = ({ route, navigation }: any) => {
  const { playlist } = route.params;
  const [songs, setSongs] = useState<Song[]>(playlist.songs || []);
  const [loading, setLoading] = useState(false);
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);
  const [loadCount, setLoadCount] = useState(10);
  const [marqueeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (songs.length > 0) {
      setDisplayedSongs(songs.slice(0, loadCount));
    }
  }, [songs, loadCount]);

  const loadMoreSongs = () => {
    if (loading) return;
    setLoading(true);
    const newLoadCount = Math.min(loadCount + 10, songs.length); // Không vượt quá số lượng bài hát
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

      if (userfavoriteDoc.exists && userfavoriteDoc.data()?.[songId]) {
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
            },
          },
          { merge: true }
        );
        console.log('Đã thêm bài hát vào thư viện');
      }
    } catch (error) {
      console.log('Lỗi khi lưu bài hát:', error);
    }
  };

  const renderSong = ({ item }: { item: Song }) => (
    <Section>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('MusicDetail', { song: item, playlist: songs })
        }
        style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri: item.image }}
          style={styles.songImage}
        />
        <Section styles={{ flexDirection: 'column', justifyContent: 'center' }}>
          <Animated.Text
            style={styles.songName}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.name}
          </Animated.Text>
          <Animated.Text
            style={styles.songArtist}
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
            <MenuOption onSelect={() => console.log('Loại bỏ bài hát')}>
              <TextComponent text="Loại bỏ bài hát" />
            </MenuOption>
            <MenuOption onSelect={() => saveTofavorite(item)}>
              <TextComponent text="Yêu thích bài hát" />
            </MenuOption>
          </MenuOptions>
        </Menu>
      </TouchableOpacity>
    </Section>
  );

  return (
    <Container style={{ backgroundColor: colors.white, flex: 1 }} isScroll={false}>
      {/* Header */}
      <Section
        styles={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 15,
          backgroundColor: colors.instagram,
        }}>
        <TextComponent
          text={playlist.name}
          color={colors.black}
          font={fontFamilies.bold}
          size={30}
        />
      </Section>

      {/* Danh sách bài hát */}
      <Space height={10} />
      <FlatList
        data={displayedSongs}
        renderItem={renderSong}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMoreSongs}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color={colors.black} /> : null
        }
      />
      <TouchableOpacity
        onPress={() => navigation.navigate('Add', { playlist: playlist })}
        style={styles.createButton}>
        <TextComponent
          text="Thêm bài hát vào danh sách"
          size={16}
          styles={styles.createButtonText}
        />
      </TouchableOpacity>
    </Container>
  );
};

const styles = StyleSheet.create({
  createButton: {
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: colors.blue,
  },
  createButtonText: {
    color: colors.white,
    fontFamily: fontFamilies.semiBold,
  },
  songImage: {
    width: 75,
    height: 75,
    borderRadius: 5,
    marginRight: 5,
  },
  songName: {
    fontFamily: fontFamilies.semiBold,
    width: 250,
    fontSize: sizes.text,
    overflow: 'hidden',
  },
  songArtist: {
    fontFamily: fontFamilies.regular,
    width: 250,
    fontSize: sizes.desc,
    overflow: 'hidden',
  },
});

export default PlaylistDetail;
