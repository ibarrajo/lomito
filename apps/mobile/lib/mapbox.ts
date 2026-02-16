import { Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

if (accessToken) {
  MapboxGL.setAccessToken(accessToken);
} else {
  console.warn(
    'Mapbox access token not configured. Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in .env',
  );
}

export const TIJUANA_CENTER = {
  longitude: -117.0382,
  latitude: 32.5149,
} as const;

export const DEFAULT_ZOOM = 12;

/** Safe street style URL — MapboxGL.StyleURL is undefined on web */
export const STREET_STYLE_URL =
  Platform.OS === 'web'
    ? 'mapbox://styles/mapbox/streets-v12'
    : (MapboxGL.StyleURL?.Street ?? 'mapbox://styles/mapbox/streets-v12');

export default MapboxGL;
