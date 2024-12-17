import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, TouchableOpacity, View } from 'react-native';
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

  const fetchSuggestedSongs = useCallback(async () => {
    setLoading(true);
    try {
      const items: Song[] = (await getMusicListByKeyword('music')) || [];
      setSuggestedSongs(items);
    } catch (error) {
      console.error('Error fetching suggested songs:', error);
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
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery);
    } else {
      setSearchResults([]);
      fetchSuggestedSongs();
    }
  }, [searchQuery, fetchSearchResults, fetchSuggestedSongs]);

  const addToPlaylist = async (song: Song) => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
        return;
      }

      const playlistId = playlist?.id;
      if (!playlistId) {
        Alert.alert('Lỗi', 'Playlist không hợp lệ.');
        return;
      }

      const playlistRef = firestore().collection('playlists').doc(userId);

      // Lấy dữ liệu của playlist từ Firestore
      const userPlaylistsDoc = await playlistRef.get();
      const userPlaylists = userPlaylistsDoc.data();

      if (!userPlaylists || !userPlaylists[playlistId]) {
        Alert.alert('Lỗi', 'Không tìm thấy playlist.');
        return;
      }

      const existingSongs = userPlaylists[playlistId].songs || [];

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
      console.error('Error adding to playlist:', error);
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
        borderBottomColor: colors.grey,
        borderBottomWidth: 0.5,
      }}
    >
      <Row>
        <Image source={{ uri: item.image }} style={{ width: 80, height: 80 }} />
        <Space width={12} />
        <View>
          <TextComponent
            styles={{ maxWidth: 150 }}
            color={colors.white}
            text={item.name}
          />
          <TextComponent
            styles={{ maxWidth: 150 }}
            color={colors.grey}
            text={item.artists}
          />
        </View>
      </Row>
      <TouchableOpacity onPress={() => addToPlaylist(item)}>
        <Ionicons color={colors.white} name="add" size={24} />
      </TouchableOpacity>
    </Row>
  );

  return (
    <Container isScroll={false} style={{ backgroundColor: colors.black }}>
      <Section styles={{ marginTop: 45 }}>
        <Row alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              style={{ marginBottom: 10 }}
              name="chevron-back"
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
          <Input
            prefix={<AntDesign name="search1" size={sizes.title} color={colors.white} />}
            clear
            inputStyles={{ color: colors.white }}
            color={colors.black2}
            styles={{ width: 300, paddingVertical: 4 }}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholderColor={colors.white}
            placeholder="Tên bài hát, nghệ sĩ, album"
          />
        </Row>
      </Section>

      <Section>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TextComponent size={sizes.title} color={colors.white} text="Đang tải..." />
          </View>
        ) : searchResults.length > 0 ? (
          <>
            <TextComponent
              font={fontFamilies.semiBold}
              size={sizes.bigTitle}
              color={colors.white}
              text="Kết quả tìm kiếm"
            />
            <Space height={20} />
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSongItem}
              initialNumToRender={8}
              removeClippedSubviews
              getItemLayout={(data, index) => ({
                length: 100,
                offset: 100 * index,
                index,
              })}
            />
          </>
        ) : searchQuery.trim() && searchResults.length === 0 ? (
          <Section>
            <Row alignItems="center" styles={{ flexDirection: 'column', marginTop: 20 }}>
              <TextComponent
                size={sizes.bigTitle}
                color={colors.white}
                text="Không tìm thấy kết quả"
              />
            </Row>
          </Section>
        ) : (
          <>
            <TextComponent
              font={fontFamilies.semiBold}
              size={sizes.bigTitle}
              color={colors.white}
              text="Gợi ý tìm kiếm"
            />
            <Space height={16} />
            <FlatList
              data={suggestedSongs}
              keyExtractor={(item) => item.id}
              renderItem={renderSongItem}
              initialNumToRender={8}
              removeClippedSubviews
              getItemLayout={(data, index) => ({
                length: 100,
                offset: 100 * index,
                index,
              })}
            />
          </>
        )}
      </Section>
      <Toast />
    </Container>
  );
};

export default AddToPlaylist;