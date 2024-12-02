// import React, {useEffect, useState, useCallback, useMemo} from 'react';
// import {View, Image, FlatList, TouchableOpacity} from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import {Button, Section, Space} from '@bsdaoquang/rncomponent';
// import Container from '../../components/Container';
// import TextComponent from '../../components/TextComponent';
// // import {getChillPlaylist, getTop100, getVPop} from '../../utils/handleAPI';
// import {ChillList, Top100, VPopList} from '../../constants/models';
// import {colors} from '../../constants/colors';
// import {fontFamilies} from '../../constants/fontFamilies';
// import {Song} from '../../constants/models'
// // import {getChillPlaylist, getVPop} from '../../utils/handleAPI'

// const HomeScreen = ({navigation}: any) => {
//   const [top100, setTop100] = useState<Top100[]>([]);
//   const [chill, setChill] = useState<ChillList[]>([]);
//   const [vpop, setVpop] = useState<VPopList[]>([]);
//   const [songs, setSongs] = useState<Song[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [displayedSongs, setDisplayedSongs]  = useState<Song[]>([])
//   const [loadCount, setLoadCount] = useState(0);

//   useEffect(() => {
//     const fetchSongs = async () => {
//       setLoading(true);
//       const fetchedSongs = await getVPop();

//       if (fetchedSongs) {
//         const validSongs = fetchedSongs.filter(
//           (song: Song) => song.preview_url,
//         );
//         setSongs(validSongs);
//         setDisplayedSongs(validSongs.slice(0, loadCount));
//       }
//       setLoading(false);
//     };

//     fetchSongs();
//   }, []);

//   const LoadMoreSongs = () => {
//     if (loading) return;
//     setLoading(true);
//     const newLoadCount = loadCount + 20;
//     setDisplayedSongs(songs.slice(0, newLoadCount));
//     setLoadCount(newLoadCount);
//     setLoading(false);
//   }

//   useEffect(() => {
//     const fetchData = async () => {
//       // const fetchedTop100 = await getTop100();
//       const fetchedChill = await getChillPlaylist();
//       const fetchedVPop = await getVPop();

//       // if (fetchedTop100) setTop100(fetchedTop100);
//       if (fetchedChill) setChill(fetchedChill);
//       if (fetchedVPop) setVpop(fetchedVPop);
//     };
//     fetchData();
//   }, []);

//   const renderItem = useCallback(
//     ({item}: {item: any}) => {
//       return (
//         <TouchableOpacity 
//           onPress={() => console.log(item)}
//         >
//           <View
//             style={{
//               flex: 1,
//               margin: 10,
//               elevation: 2,
//               backgroundColor: colors.white,
//               borderRadius: 10,
//               overflow: 'hidden',
//               width: 200,
//             }}>
//             <Image
//               source={{uri: item.image}}
//               style={{width: 200, height: 200}}
//               resizeMode="cover"
//             />
//             <TextComponent text={item.name} size={15} numberOfLines={1} />
//             <TextComponent
//               text={item.artists}
//               styles={{alignSelf: 'flex-start'}}
//               size={15}
//               font={fontFamilies.bold}
//             />
//           </View>
//         </TouchableOpacity>
//       );
//     },
//     [navigation],
//   );
  

//   // const memoizedTop100 = useMemo(() => top100, [top100]);
//   const memoizedChill = useMemo(() => chill, [chill]);
//   const memoizedVPop = useMemo(() => vpop, [vpop]);

//   return (
//     <Container style={{backgroundColor: colors.white}}>
//       <Section styles={{paddingHorizontal: 2}}>
//         <Space height={10} />
//         <View>
//           <Button
//             onPress={() => navigation.navigate('Search')}
//             styles={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               paddingHorizontal: 16,
//             }}
//             icon={<Ionicons name="search" size={20} color="black" />}
//           />
//         </View>
//       </Section>

//       {/* Top 100 Section */}
//       {/* <Section>
//         <TextComponent text="Top 100" font={fontFamilies.bold} size={30} />
//         <FlatList
//           // data={memoizedTop100}
//           data={''}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           // keyExtractor={(item, index) => `${item.name}-${index}`}
//           renderItem={renderItem}
//         />
//       </Section> */}

//       {/* Chill Section */}
//       <Section>
//         <TextComponent text="Chill" font={fontFamilies.bold} size={30} />
//         <FlatList
//           data={memoizedChill}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item, index) => `${item.name}-${index}`}
//           renderItem={renderItem}
//         />
//       </Section>

//       {/* V-Pop Section */}
//       <Section>
//         <TextComponent text="V-Pop" font={fontFamilies.bold} size={30} />
//         <FlatList
//           // data={memoizedVPop}
//           data={memoizedVPop}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           // keyExtractor={(item, index) => `${item.name}-${index}`}
//           renderItem={renderItem}
//         />
//       </Section>
//     </Container>
//   );
// };

// export default HomeScreen;
