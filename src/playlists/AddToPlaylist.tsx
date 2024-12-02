import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import TextComponent from '../components/TextComponent';
import Container from '../components/Container';
// import { colors } from '';
// import { getMusicList } from '../services/musicService'; // Giả định đường dẫn hàm API
import { colors } from '../constants/colors';
import { getMusicList } from '../utils/handleAPI';
import { Song } from '../constants/models';

const AddToPlaylist = ({ route, navigation }: any) => {
  const playlist = route?.params?.playlist;

  // if (!playlist) {
  //   return (
  //     <Container style={styles.container}>
  //       <TextComponent
  //         text="Không tìm thấy playlist"
  //         font="semiBold"
  //         size={16}
  //         styles={{ textAlign: 'center', marginTop: 20 }}
  //       />
  //     </Container>
  //   );
  // }

  const [musicList, setMusicList] = useState<Song[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredMusic, setFilteredMusic] = useState<Song[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const tracks = await getMusicList();
      if (tracks) {
        setMusicList(tracks);
        setFilteredMusic(tracks);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredMusic(musicList);
    } else {
      const filtered = musicList.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredMusic(filtered);
    }
  };

  const handleAddToPlaylist = (song: Song) => {
    playlist.songs = playlist.songs || [];
    playlist.songs.push(song);
    navigation.goBack();
  };

  return (
    <Container style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm bài hát..."
        value={searchText}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredMusic}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.songItem}
            onPress={() => handleAddToPlaylist(item)}
          >
            <Image source={{ uri: item.image }} style={styles.songImage} />
            <View style={styles.songInfo}>
              <TextComponent text={item.name} font="semiBold" size={16} />
              <TextComponent
                text={item.artists}
                font="regular"
                size={14}
                styles={styles.artistText}
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </Container>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingHorizontal: 15,
    margin: 10,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  songInfo: {
    flex: 1,
  },
  artistText: {
    color: colors.grey,
  },
});

export default AddToPlaylist;
