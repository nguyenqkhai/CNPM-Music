import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/home/HomeScreen';
import MusicList from '../screens/musics/MusicList';
import Profile from '../screens/profiles/Profile';
import { colors } from '../constants/colors';
import Libary from '../screens/libarys/Library';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const TabNavigator = () => {
    const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator 
    screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          height: 70,
          justifyContent: 'center',
          alignContent: 'center',
        },
        tabBarIcon: ({ focused, color, size }) => {
          color = focused ? colors.black : colors.black4;
          size = 30;
          let icon = <Entypo name="home" color={color} size={size} />;
          let name = 'Home';

          if (route.name === 'HomeTab') {
            icon = <AntDesign name='home' color={color} size={size} />;
          } else if (route.name === 'ProfileTab') {
            icon = <AntDesign name='profile' color={color} size={size} />
          } else if (route.name === 'MusicTab') {
            icon = <MaterialCommunityIcons name='playlist-music' color={color} size={size} />
          } else if (route.name === 'LibaryTab') {
            icon = <MaterialIcons name='library-music' color={color} size={size}/>
          }
          return (
            <View style={{ alignItems: 'center' }}>
              {icon}
            </View>
          )
        },
      })}
    >
        <Tab.Screen name='LibaryTab' component={Libary}/>
        <Tab.Screen name='HomeTab' component={HomeScreen}/>
        <Tab.Screen name='MusicTab' component={MusicList}/>
        <Tab.Screen name='ProfileTab' component={Profile}/>
    </Tab.Navigator>
  )
}

export default TabNavigator