/**
 * MapView Component (Web)
 * Full-screen Mapbox GL JS map centered on Tijuana.
 */

/// <reference lib="dom" />

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import { TIJUANA_CENTER, DEFAULT_ZOOM } from '../../lib/mapbox.web';
import type { ReactNode } from 'react';
import type { PointOfInterest } from '@lomito/shared/types/database';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Region {
  bounds: {
    ne: [number, number];
    sw: [number, number];
  };
  zoomLevel: number;
}

export type MapDisplayMode = 'pins' | 'heatmap' | 'clusters';

interface MapViewProps {
  children?: ReactNode;
  cases?: GeoJSON.FeatureCollection;
  displayMode?: MapDisplayMode;
  onMapReady?: () => void;
  onRegionDidChange?: (region: Region) => void;
  onPinPress?: (caseId: string) => void;
  jurisdictionData?: GeoJSON.FeatureCollection | null;
  showJurisdictions?: boolean;
  onJurisdictionPress?: (
    jurisdictionId: string,
    jurisdictionName: string,
  ) => void;
  poiData?: GeoJSON.FeatureCollection | null;
  showPois?: boolean;
  onPoiPress?: (poi: PointOfInterest) => void;
}

export function MapView({
  onMapReady,
  onRegionDidChange,
  cases,
  displayMode = 'clusters',
  onPinPress,
  jurisdictionData,
  showJurisdictions,
  onJurisdictionPress,
  poiData,
  showPois,
  onPoiPress,
}: MapViewProps) {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onPinPressRef = useRef(onPinPress);
  const casesRef = useRef(cases);
  const onJurisdictionPressRef = useRef(onJurisdictionPress);
  const onPoiPressRef = useRef(onPoiPress);
  const hasToken = Boolean(mapboxgl.accessToken);

  // Keep refs up to date
  onPinPressRef.current = onPinPress;
  casesRef.current = cases;
  onJurisdictionPressRef.current = onJurisdictionPress;
  onPoiPressRef.current = onPoiPress;

  useEffect(() => {
    if (!hasToken || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [TIJUANA_CENTER.longitude, TIJUANA_CENTER.latitude],
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current = map;

    map.on('load', () => {
      onMapReady?.();

      // Add GeoJSON source with clustering
      map.addSource('cases-source', {
        type: 'geojson',
        data: casesRef.current ?? { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      });

      // Cluster circles layer
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'cases-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#13ECC8', // colors.primary
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 25, 30, 35],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      // Cluster count label layer
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'cases-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-size': 14,
          'text-font': ['Public Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#FFFFFF',
        },
      });

      // Unclustered individual points
      map.addLayer({
        id: 'unclustered-points',
        type: 'circle',
        source: 'cases-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'category'],
            'abuse',
            '#C53030',
            'stray',
            '#DD6B20',
            'missing',
            '#2B6CB0',
            '#9CA3AF', // default (neutral500)
          ],
          'circle-radius': 12,
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'status'], 'resolved'],
            3,
            ['==', ['get', 'status'], 'verified'],
            2,
            ['==', ['get', 'status'], 'in_progress'],
            2,
            2,
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'status'], 'resolved'],
            '#276749',
            ['==', ['get', 'status'], 'verified'],
            '#276749',
            ['==', ['get', 'status'], 'in_progress'],
            '#2B6CB0',
            ['==', ['get', 'status'], 'rejected'],
            '#A0AEC0',
            ['==', ['get', 'status'], 'archived'],
            '#A0AEC0',
            'rgba(255, 255, 255, 0.9)',
          ],
          'circle-opacity': [
            'case',
            ['==', ['get', 'status'], 'rejected'],
            0.5,
            ['==', ['get', 'status'], 'archived'],
            0.5,
            1.0,
          ],
        },
      });

      // Heatmap layer (hidden by default)
      map.addLayer(
        {
          id: 'heatmap',
          type: 'heatmap',
          source: 'cases-source',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              1,
              14,
              3,
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(0,0,0,0)',
              0.2,
              '#13ECC8',
              0.4,
              '#0FBDA0',
              0.6,
              '#F2994A',
              0.8,
              '#DC2626',
              1,
              '#DC2626',
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              2,
              14,
              20,
            ],
            'heatmap-opacity': 0.8,
          },
          layout: {
            visibility: 'none',
          },
        },
        'unclustered-points',
      );

      // Jurisdiction boundary layers
      map.addSource('jurisdictions-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'jurisdictions-fill',
        type: 'fill',
        source: 'jurisdictions-source',
        paint: {
          'fill-color': '#1E293B', // colors.secondary
          'fill-opacity': 0.15,
        },
        layout: {
          visibility: 'none',
        },
      });

      map.addLayer({
        id: 'jurisdictions-line',
        type: 'line',
        source: 'jurisdictions-source',
        paint: {
          'line-color': '#1E293B',
          'line-width': 2,
          'line-opacity': 0.6,
        },
        layout: {
          visibility: 'none',
        },
      });

      map.addLayer({
        id: 'jurisdictions-labels',
        type: 'symbol',
        source: 'jurisdictions-source',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 14,
          'text-font': ['Public Sans SemiBold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': false,
          visibility: 'none',
        },
        paint: {
          'text-color': '#1E293B',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1.5,
        },
      });

      // POI source and layers
      map.addSource('pois-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'pois-circles',
        type: 'circle',
        source: 'pois-source',
        paint: {
          'circle-color': [
            'match',
            ['get', 'poi_type'],
            'government_office',
            '#2563EB',
            'animal_shelter',
            '#059669',
            'vet_clinic',
            '#F59E0B',
            '#64748B',
          ],
          'circle-radius': 10,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
        layout: {
          visibility: 'none',
        },
      });

      map.addLayer({
        id: 'pois-labels',
        type: 'symbol',
        source: 'pois-source',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-font': ['Public Sans SemiBold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          visibility: 'none',
        },
        paint: {
          'text-color': '#1E293B',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1,
        },
      });

      // Click handler for POI circles
      map.on('click', 'pois-circles', (e) => {
        const feature = e.features?.[0];
        if (feature?.properties) {
          onPoiPressRef.current?.(
            feature.properties as unknown as PointOfInterest,
          );
        }
      });

      map.on('mouseenter', 'pois-circles', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = 'pointer';
      });
      map.on('mouseleave', 'pois-circles', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = '';
      });

      // Click handler for jurisdiction boundaries
      map.on('click', 'jurisdictions-fill', (e) => {
        const feature = e.features?.[0];
        if (feature?.properties?.id && feature?.properties?.name) {
          onJurisdictionPressRef.current?.(
            feature.properties.id as string,
            feature.properties.name as string,
          );
        }
      });

      map.on('mouseenter', 'jurisdictions-fill', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = 'pointer';
      });
      map.on('mouseleave', 'jurisdictions-fill', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = '';
      });

      // Click handler for unclustered points
      map.on('click', 'unclustered-points', (e) => {
        const feature = e.features?.[0];
        if (feature?.properties?.id) {
          onPinPressRef.current?.(feature.properties.id as string);
        }
      });

      // Change cursor on hover
      map.on('mouseenter', 'unclustered-points', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-points', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = '';
      });

      // Handle cluster clicks - zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource('cases-source');
        if (
          source &&
          'getClusterExpansionZoom' in source &&
          clusterId != null
        ) {
          (source as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err || zoom == null) return;
              map.easeTo({
                center: (features[0].geometry as GeoJSON.Point).coordinates as [
                  number,
                  number,
                ],
                zoom,
              });
            },
          );
        }
      });
      map.on('mouseenter', 'clusters', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = '';
      });
    });

    map.on('moveend', () => {
      if (!onRegionDidChange) return;
      const bounds = map.getBounds();
      if (!bounds) return;
      onRegionDidChange({
        bounds: {
          ne: [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
          sw: [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
        },
        zoomLevel: map.getZoom(),
      });
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [hasToken, onMapReady, onRegionDidChange]);

  // Update GeoJSON data when cases prop changes
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource('cases-source') as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (source) {
      source.setData(cases ?? { type: 'FeatureCollection', features: [] });
    }
  }, [cases]);

  // Toggle layer visibility based on display mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const setVisibility = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          'visibility',
          visible ? 'visible' : 'none',
        );
      }
    };

    switch (displayMode) {
      case 'pins':
        setVisibility('unclustered-points', true);
        setVisibility('clusters', false);
        setVisibility('cluster-count', false);
        setVisibility('heatmap', false);
        break;
      case 'heatmap':
        setVisibility('unclustered-points', false);
        setVisibility('clusters', false);
        setVisibility('cluster-count', false);
        setVisibility('heatmap', true);
        break;
      case 'clusters':
      default:
        setVisibility('unclustered-points', true);
        setVisibility('clusters', true);
        setVisibility('cluster-count', true);
        setVisibility('heatmap', false);
        break;
    }
  }, [displayMode]);

  // Update jurisdiction GeoJSON data when jurisdictionData prop changes
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource('jurisdictions-source') as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (source) {
      source.setData(
        jurisdictionData ?? { type: 'FeatureCollection', features: [] },
      );
    }
  }, [jurisdictionData]);

  // Toggle jurisdiction layer visibility when showJurisdictions prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const visibility = showJurisdictions ? 'visible' : 'none';
    for (const layerId of [
      'jurisdictions-fill',
      'jurisdictions-line',
      'jurisdictions-labels',
    ]) {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visibility);
      }
    }
  }, [showJurisdictions]);

  // Update POI GeoJSON data when poiData prop changes
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource('pois-source') as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (source) {
      source.setData(poiData ?? { type: 'FeatureCollection', features: [] });
    }
  }, [poiData]);

  // Toggle POI layer visibility when showPois prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const visibility = showPois ? 'visible' : 'none';
    for (const layerId of ['pois-circles', 'pois-labels']) {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visibility);
      }
    }
  }, [showPois]);

  if (!hasToken) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>{t('map.title')}</Text>
        <Text style={styles.placeholderText}>{t('map.placeholderText')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    backgroundColor: '#E8E0D8',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  placeholderTitle: {
    color: '#1F2328',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
});
