import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
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
import Octicons from 'react-native-vector-icons/Octicons'
import Ionicons from 'react-native-vector-icons/Ionicons';

const PlaylistDetail = ({ route, navigation }: any) => {
  const { playlist } = route.params;

  const [songs, setSongs] = useState<Song[]>(playlist.songs || []);
  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;

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
          { merge: true },
        );
        console.log('Đã thêm bài hát vào thư viện');
      }
    } catch (error) {
      console.log('Lỗi khi lưu bài hát:', error);
    }
  };
  const renderSong = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => { navigation.navigate('MusicDetail', { song: item, playlist: songs }) }}>
      <View style={{ width: 130 }}>
        <Image source={{ uri: item.image }} style={styles.songImage} />
      </View>
      <Space width={16} />
      <View style={styles.songInfo}>
        <TextComponent text={item.name} numberOfLines={2} styles={[styles.songName, { maxWidth: 180 }]} />
        <TextComponent text={item.artists} styles={styles.songArtist} />
      </View>
      <TouchableOpacity onPress={() => saveTofavorite(item)}>
        <Icon name="heart" size={24} color={colors.grey} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Container style={styles.container} isScroll={false}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.black2, borderBottomWidth: 1, marginBottom: 12 }]}>
        <GridImage images={songs.map((song: Song) => song.image)} />
        <View style={styles.playlistInfo}>
          <TextComponent size={20} text={playlist.name} numberOfLines={2} styles={styles.playlistName} />
          <TextComponent size={18} text={`${user?.displayName}`} />
          <TextComponent size={18} text={`${songs.length} bài hát`} />
        </View>
        <Section
          styles={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <Octicons name='download' size={30} color={colors.black} />
            <TextComponent text='Tải xuống' />
          </TouchableOpacity>
          <Space width={30} />
          <TouchableOpacity style={styles.shuffleButton}>
            <TextComponent text="PHÁT PLAYLIST" styles={styles.shuffleText} />
          </TouchableOpacity>
          <Space width={30} />
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => { navigation.navigate('Add', { playlist: playlist }) }}>
            <Ionicons name='add-circle-outline' size={30} color={colors.black} />
            <TextComponent text="Thêm" />
          </TouchableOpacity>
        </Section>
      </View>

      {/* Danh sách bài hát */}
      <FlatList
        data={songs}
        renderItem={renderSong}
        keyExtractor={item => item.id.toString()}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.black} />
          ) : null
        }
      />
    </Container>
  );
};

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
    // width: 100,
  },
  songImage: { width: 145, height: 80, borderRadius: 4 },
  songInfo: { flex: 1, marginLeft: 10 },
  songName: { fontSize: 16, fontFamily: fontFamilies.semiBold },
  songArtist: { fontSize: 14, color: colors.black },
});

export default PlaylistDetail;
