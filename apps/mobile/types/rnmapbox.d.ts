/**
 * Type declarations for @rnmapbox/maps
 * This is a minimal declaration to allow compilation when the package isn't installed yet.
 * Once @rnmapbox/maps is installed, these will be overridden by the actual types.
 */

declare module '@rnmapbox/maps' {
  import type { Component, ComponentType, ReactNode } from 'react';
  import type { ViewStyle } from 'react-native';

  export interface CameraProps {
    zoomLevel?: number;
    centerCoordinate?: [number, number];
  }

  export interface MapViewProps {
    style?: ViewStyle;
    styleURL?: string;
    onDidFinishLoadingMap?: () => void;
    compassEnabled?: boolean;
    scaleBarEnabled?: boolean;
    children?: ReactNode;
  }

  export interface PointAnnotationProps {
    id: string;
    coordinate: [number, number];
    onSelected?: () => void;
    children?: ReactNode;
  }

  export const StyleURL: {
    Street: string;
    Outdoors: string;
    Light: string;
    Dark: string;
    Satellite: string;
    SatelliteStreet: string;
  };

  export const Camera: ComponentType<CameraProps>;
  export const MapView: ComponentType<MapViewProps>;
  export const PointAnnotation: ComponentType<PointAnnotationProps>;

  export function setAccessToken(token: string): void;

  const MapboxGL: {
    setAccessToken: typeof setAccessToken;
    Camera: typeof Camera;
    MapView: typeof MapView;
    PointAnnotation: typeof PointAnnotation;
    StyleURL: typeof StyleURL;
  };

  export default MapboxGL;
}
