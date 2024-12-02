import { Input, Row, Section, Space } from '@bsdaoquang/rncomponent';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import { Song } from '../../constants/models';
import { sizes } from '../../constants/sizes';
import TextComponent from '../../components/TextComponent';
import Container from '../../components/Container';
import { searchMusic } from '../../utils/handleAPI';

const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);

  // Fetch suggested songs for empty search
  const fetchSuggestedSongs = useCallback(async () => {
    const items: Song[] = (await searchMusic('chill music') || []); // Replace with your own logic for fetching suggestions
    setSuggestedSongs(items || []);
  }, []);

  // Fetch search results when query changes
  const handleGetSearchSongs = useCallback(async (query: string) => {
    const items: Song[] = (await searchMusic(query) || []);
    setSearchResults(items || []);  // Ensure that null is handled properly
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleGetSearchSongs(searchQuery);  // Only search if query is not empty
    } else {
      setSearchResults([]);
      fetchSuggestedSongs();  // Fetch suggested songs when search query is empty
    }
  }, [searchQuery, handleGetSearchSongs, fetchSuggestedSongs]);

  return (
    <Container isScroll={false} style={{ backgroundColor: colors.black }}>
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
        {searchResults.length > 0 ? (
          <>
            <TextComponent
              font={fontFamilies.semiBold}
              size={sizes.bigTitle}
              color={colors.white}
              text="Kết quả tìm kiếm"
            />
            <Space height={20} />
            <FlatList
              key={searchResults.length > 0 ? 'search' : 'suggested'}
              data={searchResults}
              numColumns={2}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('SongDetails', {
                      song: item,
                    })
                  }
                  style={{ marginHorizontal: 6, marginVertical: 6 }}
                >
                  <Row>
                    <Image
                      source={{ uri: item.image }}
                      width={50}
                      height={50}
                      style={{ width: 100, height: 100 }}
                    />
                    <TextComponent color={colors.white} text={item.name} />
                    <TextComponent color={colors.grey} text={item.artists} />
                  </Row>
                </TouchableOpacity>
              )}
              initialNumToRender={8}
              removeClippedSubviews
            />
          </>
        ) : searchQuery.trim() && searchResults.length === 0 ? (
          <Section>
            <Row alignItems="center" styles={{ flexDirection: 'column', marginTop: 20 }}>
              <Image
                source={require('../../../assets/images/luffy.jpg')}
                width={150}
                height={100}
                style={{ width: 150, height: 100 }}
              />
              <Space height={12} />
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
              style={{ marginBottom: 160 }}
              data={suggestedSongs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('SongDetails', {
                      song: item,
                    })
                  }
                >
                  <Row
                    justifyContent="space-between"
                    styles={{
                      paddingVertical: 12,
                      borderBottomColor: colors.grey,
                      borderBottomWidth: 0.5,
                    }}
                  >
                    <Row>
                      <Image
                        source={{ uri: item.image }}
                        width={50}
                        height={50}
                        style={{ width: 150, height: 80 }}
                      />
                      <Space width={12} />
                      <TextComponent
                        styles={{ maxWidth: 150 }}
                        color={colors.white}
                        text={item.name}
                      />
                    </Row>
                    <AntDesign color={colors.white} name="playcircleo" size={24} />
                  </Row>
                </TouchableOpacity>
              )}
              initialNumToRender={8}
              removeClippedSubviews
            />
          </>
        )}
      </Section>
    </Container>
  );
};

export default SearchScreen;
