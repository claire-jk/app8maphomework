import config from '@gluestack-ui/config';
import { Box, GluestackUIProvider } from '@gluestack-ui/themed';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import mapStyle from "../../scripts/mapStyle.json";

// 1. 引入 FontAwesome 圖示 (Expo 標準寫法)
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function App() {
  const [msg, setMsg] = useState("Waiting...");
  const [region, setRegion] = useState({
    longitude: 121.544637,
    latitude: 25.024624,
    longitudeDelta: 0.01,
    latitudeDelta: 0.02,
  });
  
  useEffect(() => {
    (async () => {
      // 1. 請求定位權限
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMsg('Permission to access location was denied');
        return;
      }

      // 2. 取得目前位置
      let location = await Location.getCurrentPositionAsync({});
      
      // 3. 更新狀態 (這會顯示經緯度 JSON 字串)
      setMsg(JSON.stringify(location));

      // 4. 自動將地圖中心移動到使用者目前位置
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const [marker, setMarker] = useState({
    coord: {
      latitude: 25.024624,
      longitude: 121.544637,
    },
    name: "國立臺北教育大學",
    address: "台北市大安區和平東路二段134號"
  });

  const onRegionChangeComplete = (rgn: any) => {
    // 僅判斷是否需要更新地圖視角 (Region)
    if (
      Math.abs(rgn.latitude - region.latitude) > 0.0002 ||
      Math.abs(rgn.longitude - region.longitude) > 0.0002
    ) {
      setRegion(rgn);
      // 注意：這裡不再執行 setMarker，所以 Marker 會固定在初始位置
    }
  };

  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config}>
        <Box flex={1}>
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            region={region}
            style={styles.map}
            customMapStyle={mapStyle}
            onRegionChangeComplete={onRegionChangeComplete}
          >
            <Marker
              coordinate={marker.coord} // 這會指向北教大 (25.024624, 121.544637)
              title={marker.name}
              description={marker.address}
            >
              <FontAwesome name={"map-marker"} size={35} color="#B12A5B" />
            </Marker>
          </MapView>
        </Box>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});