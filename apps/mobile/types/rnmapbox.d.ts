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
    onRegionDidChange?: (feature: unknown) => void;
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

  export interface ShapeSourceProps {
    id: string;
    shape: GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry;
    cluster?: boolean;
    clusterRadius?: number;
    clusterMaxZoomLevel?: number;
    onPress?: (event: unknown) => void;
    children?: ReactNode;
  }

  export interface CircleLayerProps {
    id: string;
    style?: {
      circleRadius?: number | unknown[];
      circleColor?: string | unknown[];
      circleOpacity?: number;
      circleStrokeWidth?: number;
      circleStrokeColor?: string;
    };
    filter?: unknown[];
  }

  export interface SymbolLayerProps {
    id: string;
    style?: {
      textField?: string | unknown[];
      textSize?: number;
      textColor?: string;
      textFont?: string[];
      textAllowOverlap?: boolean;
    };
    filter?: unknown[];
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
  export const ShapeSource: ComponentType<ShapeSourceProps>;
  export const CircleLayer: ComponentType<CircleLayerProps>;
  export const SymbolLayer: ComponentType<SymbolLayerProps>;

  export function setAccessToken(token: string): void;

  const MapboxGL: {
    setAccessToken: typeof setAccessToken;
    Camera: typeof Camera;
    MapView: typeof MapView;
    PointAnnotation: typeof PointAnnotation;
    ShapeSource: typeof ShapeSource;
    CircleLayer: typeof CircleLayer;
    SymbolLayer: typeof SymbolLayer;
    StyleURL: typeof StyleURL;
  };

  export default MapboxGL;
}
