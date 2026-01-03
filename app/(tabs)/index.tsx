import FontAwesome from '@expo/vector-icons/FontAwesome';
import config from '@gluestack-ui/config';
import { Box, Center, Fab, FabIcon, GluestackUIProvider, Text } from '@gluestack-ui/themed'; // 引入 Fab 組件
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import mapStyle from "../../scripts/mapStyle.json";

export default function App() {
  const [msg, setMsg] = useState("Waiting...");
  const [region, setRegion] = useState({
    longitude: 121.544637,
    latitude: 25.024624,
    longitudeDelta: 0.01,
    latitudeDelta: 0.02,
  });

  const [marker, setMarker] = useState({
    coord: {
      latitude: 25.024624,
      longitude: 121.544637,
    },
    name: "我的位置",
    address: "動態更新中"
  });

  // 封裝更新地圖與 Marker 的函式
  const setRegionAndMarker = (location: any) => {
    setRegion({
      ...region,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    setMarker({
      ...marker,
      coord: {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      },
    });
  };

  // 定義定位按鈕觸發的函式
  const goToMyLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    setMsg(JSON.stringify(location));
    setRegionAndMarker(location);
  };

  useEffect(() => {
    const getLocation = async () => {
      // 1. 請求定位權限
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMsg('Permission to access location was denied');
        return;
      }

      // 2. 取得初始位置
      let location = await Location.getCurrentPositionAsync({});
      setMsg(JSON.stringify(location));
      setRegionAndMarker(location);

      // 3. 持續監控位置變化
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 100, // 距離大於 100 米才更新
          timeInterval: 1000,    // 每 1000 毫秒檢查一次
        },
        (loc) => {
          setMsg(JSON.stringify(loc));
          setRegionAndMarker(loc);
        }
      );
    };

    getLocation();
  }, []);

  const onRegionChangeComplete = (rgn: any) => {
    if (
      Math.abs(rgn.latitude - region.latitude) > 0.0002 ||
      Math.abs(rgn.longitude - region.longitude) > 0.0002
    ) {
      setRegion(rgn);
    }
  };

  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config}>
        <Box flex={1}>
          <Center h={100} bg="$coolGray100" px="$4">
             <Text size="xs" textAlign="center">{msg}</Text>
          </Center>

          <Box flex={1}>
            <MapView
              provider={PROVIDER_GOOGLE}
              region={region}
              style={styles.map}
              customMapStyle={mapStyle}
              onRegionChangeComplete={onRegionChangeComplete}
            >
              <Marker
                coordinate={marker.coord}
                title={marker.name}
                description={marker.address}
              >
                <FontAwesome name={"map-marker"} size={35} color="#B12A5B" />
              </Marker>
            </MapView>

            {/* 定位按鈕 (FAB) */}
            <Fab
              size="lg" // 1. 設定為 lg (Large) 放大按鈕
              placement="bottom right" // 2. 確保在右下角
              onPress={goToMyLocation}
              bg="$primary600" // 稍微加深顏色增加辨識度
              style={styles.fabCustom} // 3. 透過 style 進一步自訂大小
            >
              <FabIcon 
                // 4. 同步放大內部的圖示尺寸
                as={() => <FontAwesome name="crosshairs" size={30} color="white" />} 
              />
            </Fab>
          </Box>
        </Box>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject, // 讓地圖填滿容器
  },
  fabCustom: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 70, 
    height: 70,
    borderRadius: 35,
    marginBottom: 20, // 距離底部距離
    marginRight: 20,  // 距離右邊距離
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android 陰影
    shadowColor: '#000', // iOS 陰影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});