import { useState, useCallback, useRef } from "react";
import Map, { Source, Layer, NavigationControl, Popup } from "react-map-gl/mapbox";
import type { MapRef, LayerProps, MapLayerMouseEvent } from "react-map-gl/mapbox";
import { useNavigate } from "react-router";
import "mapbox-gl/dist/mapbox-gl.css";

import MY_GEOJSON from "./GALS.json";

const fillLayer: LayerProps = {
  id: "regions-fill",
  type: "fill",
  paint: {
    "fill-color": [
      "case",
      ["boolean", ["feature-state", "selected"], true],
      "#ff6b6b", // Red for selected
      ["boolean", ["feature-state", "hover"], true],
      "#ffd93d", // Yellow for hover
      "#1d3557", // Default blue
    ],
    "fill-opacity": 0.7,
  },
};

const lineLayer: LayerProps = {
  id: "regions-line",
  type: "line",
  paint: {
    "line-color": "#a8dadc",
    "line-width": 1.5,
  },
};

export default function DACHMap() {
  const mapRef = useRef<MapRef>(null);
  const navigate = useNavigate();

  const [viewState, setViewState] = useState({
    longitude: 15.0,
    latitude: 55.0,
    zoom: 3.2,
  });

  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  const [popupInfo, setPopupInfo] = useState<{
    lngLat: [number, number];
    text: string;
  } | null>(null);

  const onClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const features = event.features;
      if (features && features.length > 0) {
        const feature = features[0];
        const regionId = feature.id as number;

        // Reset previous selection
        if (selectedRegion !== null) {
          mapRef.current?.setFeatureState(
            { source: "regions", id: selectedRegion },
            { selected: false }
          );
        }

        // Set new selection
        setSelectedRegion(regionId);
        mapRef.current?.setFeatureState(
          { source: "regions", id: regionId },
          { selected: true }
        );

        // Navigate to chat with region
        navigate(`/chat/${regionId}`);
      }
    },
    [selectedRegion, navigate]
  );

  const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
    const features = event.features;
    if (features && features.length > 0) {
      const feature = features[0];
      const regionId = feature.id as number;

      // Reset previous hover
      if (hoveredRegion !== null && hoveredRegion !== selectedRegion) {
        mapRef.current?.setFeatureState(
          { source: "regions", id: hoveredRegion },
          { hover: false }
        );
      }

      // Set new hover if not selected
      if (regionId !== selectedRegion) {
        setHoveredRegion(regionId);
        mapRef.current?.setFeatureState(
          { source: "regions", id: regionId },
          { hover: true }
        );
      }

      // Show popup
      setPopupInfo({
        lngLat: [event.lngLat.lng, event.lngLat.lat],
        text: `Region ${regionId}`,
      });
    } else {
      // Reset hover
      if (hoveredRegion !== null && hoveredRegion !== selectedRegion) {
        mapRef.current?.setFeatureState(
          { source: "regions", id: hoveredRegion },
          { hover: false }
        );
      }
      setHoveredRegion(null);
      setPopupInfo(null);
    }
  }, [hoveredRegion, selectedRegion]);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      onClick={onClick}
      onMouseMove={onMouseMove}
      interactiveLayerIds={["regions-fill"]}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
    >

      <Source id="regions" type="geojson" data={MY_GEOJSON} generateId>
        <Layer {...fillLayer} />
        <Layer {...lineLayer} />
      </Source>

      {popupInfo && (
        <Popup
          longitude={popupInfo.lngLat[0]}
          latitude={popupInfo.lngLat[1]}
          closeButton={false}
          closeOnClick={false}
          offset={[0, -10]}
        >
          {popupInfo.text}
        </Popup>
      )}
    </Map>
  );
}
