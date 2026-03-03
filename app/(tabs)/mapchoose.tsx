// app/components/mapchoose.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Box, Center, Fab, FabIcon, Text } from '@gluestack-ui/themed';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';

import mapStyle from "../../scripts/mapStyle.json";
import stationsData from "../../scripts/stations.json";

export default function MapChoose() {

  const tabBarHeight = useBottomTabBarHeight(); // ⭐ 取得底部 tab 高度

  const [region, setRegion] = useState({
    longitude: 121.544637,
    latitude: 25.024624,
    longitudeDelta: 0.02,
    latitudeDelta: 0.02,
  });

  const [marker, setMarker] = useState({
    coord: { latitude: 25.024624, longitude: 121.544637 },
  });

  const [selectedBike, setSelectedBike] = useState<any | null>(null);
  const [bikeData, setBikeData] = useState<any[]>([]);

  /* 定位 */
  const setRegionAndMarker = (location: any) => {
    setRegion({
      ...region,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    setMarker({
      coord: {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      },
    });
  };

  const goToMyLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    setRegionAndMarker(location);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setRegionAndMarker(location);
    })();
  }, []);

  /* 抓取即時資料 */
  const fetchBikeData = async () => {
    try {
      const response = await fetch(
        "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
      );
      const data = await response.json();
      setBikeData(data);
    } catch (error) {
      console.log("取得YouBike資料失敗", error);
    }
  };

  useEffect(() => {
    fetchBikeData();
    const interval = setInterval(fetchBikeData, 30000);
    return () => clearInterval(interval);
  }, []);

  /* 更新選中站點 */
  useEffect(() => {
    if (selectedBike) {
      const updated = bikeData.find(b => b.sno === selectedBike.sno);
      if (updated) setSelectedBike(updated);
    }
  }, [bikeData]);

  const handleSelectBike = useCallback((bike: any) => {
    setSelectedBike(bike);
  }, []);

  /* 圓餅圖 */
  const rent = selectedBike?.available_rent_bikes ?? 0;
  const ret = selectedBike?.available_return_bikes ?? 0;
  const total = rent + ret;

  const createArc = (startAngle: number, percentage: number, color: string) => {
    const angle = percentage * 360;
    const largeArc = angle > 180 ? 1 : 0;
    const radius = 50;

    const startX = 50 + radius * Math.sin((startAngle * Math.PI) / 180);
    const startY = 50 - radius * Math.cos((startAngle * Math.PI) / 180);
    const endAngle = startAngle + angle;
    const endX = 50 + radius * Math.sin((endAngle * Math.PI) / 180);
    const endY = 50 - radius * Math.cos((endAngle * Math.PI) / 180);

    return (
      <Path
        d={`M50 50 L${startX} ${startY} A50 50 0 ${largeArc} 1 ${endX} ${endY} Z`}
        fill={color}
      />
    );
  };

  return (
    <Box style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        region={region}
        style={styles.map}
        customMapStyle={mapStyle}
        onStartShouldSetResponder={() => {
          setSelectedBike(null);
          return false;
        }}
      >
        {bikeData.slice(0, 200).map(bike => (
          <Marker
            key={bike.sno}
            coordinate={{ latitude: bike.latitude, longitude: bike.longitude }}
            onPress={() => handleSelectBike(bike)}
          >
            <FontAwesome name="bicycle" size={20} color="#4CAF50" />
          </Marker>
        ))}

        {stationsData.map(station => (
          <Marker
            key={station.StationUID}
            coordinate={{
              latitude: station.StationPosition.PositionLat,
              longitude: station.StationPosition.PositionLon,
            }}
          >
            <FontAwesome name="subway" size={24} color="#0072BC" />
          </Marker>
        ))}

        <Marker coordinate={marker.coord}>
          <FontAwesome name="map-marker" size={34} color="#B12A5B" />
        </Marker>
      </MapView>

      {/* ⭐ 修正重點：bottom = tabBarHeight */}
      {selectedBike && (
        <Box style={[styles.sheet, { bottom: tabBarHeight }]}>
          <TouchableOpacity
            style={styles.close}
            onPress={() => setSelectedBike(null)}
          >
            <Text style={styles.font}>✕</Text>
          </TouchableOpacity>

          <Text style={[styles.title, styles.font]}>
            {selectedBike.sna.replace("YouBike2.0_", "")}
          </Text>

          <Text style={[styles.address, styles.font]}>
            {selectedBike.ar}
          </Text>

          <Text style={[styles.time, styles.font]}>
            更新時間：{selectedBike.mday}
          </Text>

          <Center style={{ marginTop: 24 }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
              {total === 0 ? (
                <Path
                  d="M50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0"
                  fill="#ccc"
                />
              ) : (
                <>
                  {createArc(0, rent / total, "#FDD835")}
                  {createArc((rent / total) * 360, ret / total, "#E57373")}
                </>
              )}
            </Svg>

            <Box style={styles.legend}>
              <Text style={[styles.font, { color: '#E57373' }]}>
                可還 ({ret})
              </Text>
              <Text style={[styles.font, { color: '#FDD835' }]}>
                可借 ({rent})
              </Text>
            </Box>
          </Center>
        </Box>
      )}

      <Fab
        size="lg"
        placement="bottom right"
        onPress={goToMyLocation}
        style={[styles.fab, { bottom: tabBarHeight + 20 }]} // ⭐ 避開 tab
      >
        <FabIcon as={() => <FontAwesome name="crosshairs" size={28} color="white" />} />
      </Fab>
    </Box>
  );
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject },

  font: {
    fontFamily: 'ZenKurenaido_400Regular', // ⭐ 正確字體名稱
  },

  fab: {
    position: 'absolute',
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9a9a9ade',
  },

  sheet: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },

  close: {
    position: 'absolute',
    right: 20,
    top: 16,
    zIndex: 10,
  },

  title: {
    fontSize: 18,
    marginBottom: 4,
  },

  address: {
    fontSize: 14,
    color: '#666',
  },

  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  legend: {
    flexDirection: 'row',
    marginTop: 12,
    width: '100%',
    justifyContent: 'space-around',
  },
});