import FontAwesome from '@expo/vector-icons/FontAwesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';

import InputSearch from './inputsearch';
import MapChoose from './mapchoose';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarShowLabel: true, // ⭐ 強制顯示 label

        tabBarIcon: ({ color, size }) => {
          let iconName: any =
            route.name === '地圖尋車' ? 'map' : 'search';

          return (
            <FontAwesome
              name={iconName}
              size={22}
              color={color}
            />
          );
        },

        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#888',

        tabBarLabelStyle: {
          fontFamily: 'ZenKurenaido_400Regular',
          fontSize: 12,
          marginTop: 2,
        },

        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },

        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen
        name="地圖尋車"
        component={MapChoose}
      />
      <Tab.Screen
        name="站點搜尋"
        component={InputSearch}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,

    height: 75,              // ⭐ 稍微加高
    paddingBottom: 8,        // ⭐ 給 label 空間
    paddingTop: 6,

    borderRadius: 28,

    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 15,
  },
});