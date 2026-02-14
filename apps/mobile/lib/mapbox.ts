/* eslint-disable import/no-unresolved -- @rnmapbox/maps will be installed in a later task */
import MapboxGL from '@rnmapbox/maps';
/* eslint-enable import/no-unresolved */

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

export default MapboxGL;
