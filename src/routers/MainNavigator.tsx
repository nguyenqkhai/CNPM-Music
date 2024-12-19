import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import TabNavigator from './TabNavigator';
import SearchScreen from '../screens/search/SearchScreen';
import MusicDetail from '../screens/musics/MusicDetail';
import Favorite from '../screens/favorites/Favorite';
import CreatePlaylist from '../playlists/CreatePlaylist';
import AddToPlaylist from '../playlists/AddToPlaylist';
import PlaylistDetail from '../playlists/PlaylistDetail';
import MusicScreenDetail from '../screens/musics/MusicScreenDetail';
import ShowPlaylist from '../playlists/ShowPlaylist';

const MainNagivator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tab" component={TabNavigator} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MusicDetail" component={MusicDetail} />
      <Stack.Screen name="Favorite" component={Favorite} />
      <Stack.Screen name="Create" component={CreatePlaylist} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetail} />
      <Stack.Screen name="Add" component={AddToPlaylist} />
      <Stack.Screen name="MusicDetailYoutube" component={MusicScreenDetail} />
      <Stack.Screen name="ShowPlaylist" component={ShowPlaylist} />
    </Stack.Navigator>
  );
};

export default MainNagivator;