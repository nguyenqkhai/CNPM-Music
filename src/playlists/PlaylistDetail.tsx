import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import TextComponent from '../components/TextComponent';
import { fontFamilies } from '../constants/fontFamilies';
import Container from '../components/Container';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Song } from '../constants/models';
import GridImage from '../playlists/GridImage';
import { Section, Space } from '@bsdaoquang/rncomponent';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const PlaylistDetail = ({ route, navigation }: any) => {
  const { playlist } = route.params;

  const [songs, setSongs] = useState<Song[]>(playlist.songs || []);
  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;
  const userId = user?.uid || undefined;

  const removeSongFromPlaylist = async (userId: string, playlistId: string, songId: string) => {
    try {
      const playlistRef = firestore().collection('playlists').doc(userId);
      const userPlaylistsDoc = await playlistRef.get();
      if (!userPlaylistsDoc.exists) {
        Alert.alert('Thông báo', 'Người dùng không tồn tại.');
        return;
      }

      const userPlaylists = userPlaylistsDoc.data();
      const playlistData = userPlaylists?.[playlistId];

      if (!playlistData) {
        Toast.show({
          type: 'info',
          text1: 'Thông báo',
          text2: 'Playlist không tồn tại.'
        })
        return;
      }
      const updatedSongs = playlistData.songs.filter((song: Song) => song.id !== songId);
      await playlistRef.update({
        [`${playlistId}.songs`]: updatedSongs,
      });
      setSongs(updatedSongs);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã xóa bài hát khỏi playlist.',
      });
    } catch (error) {
      console.error('Lỗi khi xóa bài hát:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể xóa bài hát. Vui lòng thử lại.',
      });
    }
  };

  const renderSong = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => {
        navigation.navigate('MusicDetail', { song: item, playlist: songs });
      }}
    >
      <View style={{ width: 130 }}>
        <Image source={{ uri: item.image }} style={styles.songImage} />
      </View>
      <Space width={16} />
      <View style={styles.songInfo}>
        <TextComponent
          text={item.name}
          numberOfLines={2}
          styles={[styles.songName, { maxWidth: 180 }]}
        />
        <TextComponent text={item.artists} styles={styles.songArtist} />
      </View>
      <TouchableOpacity
        onPress={() => {
          if (userId) {
            removeSongFromPlaylist(userId, playlist.id, item.id);
          } else {
            Toast.show({
              type: 'info',
              text1: 'Thông báo',
              text2: 'Bạn chưa đăng nhập.'
            })
          }
        }}
      >
        <MaterialIcons name="delete" size={24} color={colors.red} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Container style={styles.container} isScroll={false}>
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.black2, borderBottomWidth: 1, marginBottom: 12 },
        ]}
      >
        {songs.length === 0 ? (
          <Section styles={{ alignItems: 'center', marginTop: 50 }}>
            <Feather name="music" size={100} color={colors.lightGray} />
            <TextComponent
              text="Không có bài hát trong danh sách"
              font={fontFamilies.regular}
              size={18}
              color={colors.black2}
              styles={{ marginTop: 10 }}
            />
          </Section>
        ) : (
          <GridImage images={songs.map((song: Song) => song.image)} />
        )}
        <View style={styles.playlistInfo}>
          <TextComponent
            size={20}
            text={playlist.name}
            numberOfLines={2}
            styles={styles.playlistName}
          />
          <TextComponent size={18} text={`${user?.displayName}`} />
          <TextComponent size={18} text={`${songs.length} bài hát`} />
        </View>
        <Section
          styles={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <Octicons name="download" size={30} color={colors.black} />
            <TextComponent text="Tải xuống" />
          </TouchableOpacity>
          <Space width={30} />
          <TouchableOpacity
            style={styles.shuffleButton}
            onPress={() => {
              if (songs.length !== 0) {
                navigation.navigate('MusicDetail', { playlist: songs, song: songs[0] });
              }
            }}
          >
            <TextComponent text="PHÁT PLAYLIST" styles={styles.shuffleText} />
          </TouchableOpacity>
          <Space width={30} />
          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => {
              navigation.navigate('Add', { playlist });
            }}
          >
            <Ionicons name="add-circle-outline" size={30} color={colors.black} />
            <TextComponent text="Thêm" />
          </TouchableOpacity>
        </Section>
      </View>

      <FlatList
        data={songs}
        renderItem={renderSong}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color={colors.black} /> : null
        }
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { alignItems: 'center', padding: 20, paddingBottom: 2 },
  playlistInfo: { alignItems: 'center', marginVertical: 10 },
  playlistName: {
    fontSize: 28,
    fontFamily: fontFamilies.bold,
    color: colors.black,
  },
  shuffleButton: {
    backgroundColor: colors.instagram,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 10,
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
  songInfo: { flex: 1, marginLeft: 10 },
  songName: { fontSize: 16, fontFamily: fontFamilies.semiBold },
  songArtist: { fontSize: 14, color: colors.black },
});

export default PlaylistDetail;
