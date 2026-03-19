import { useState, useCallback, useRef } from "react";
import Map, { Source, Layer, NavigationControl, Popup } from "react-map-gl/mapbox";
import type { MapRef, LayerProps, MapLayerMouseEvent } from "react-map-gl/mapbox";
import { useNavigate } from "react-router";
import "mapbox-gl/dist/mapbox-gl.css";

import MY_GEOJSON from "./GALS.json";

// ─── 1. Define your region colours ───────────────────────────────────────────
// Keys must match the `name` property in your GeoJSON features.
const REGION_COLORS: Record<string, string> = {
  "Region A": "#4cc9f0",
  "Region B": "#f72585",
  "Region C": "#7209b7",
  "Region D": "#3a86ff",
  "Region E": "#fb5607",
  "Region F": "#fb5607",
  "Region G": "#fb5607",
  "Region H": "#fb5607",
  "Region I": "#fb5607",
  "Region J": "#fb5607",
  "Region K": "#fb5607",
  "Region L": "#fb5607",
  "Region M": "#fb5607",
};
const DEFAULT_COLOR = "#FFFFFF"; // white fallback for any regions not in the map above

// Format ["case", ["==", ["get", "name"], "Region A"], "#4cc9f0", ... fallback]
const buildColorExpression = (): mapboxgl.Expression => {
  const cases: unknown[] = ["case"];
  for (const [name, color] of Object.entries(REGION_COLORS)) {
    cases.push(["==", ["get", "name"], name], color);
  }
  cases.push(DEFAULT_COLOR); // fallback
  return cases as mapboxgl.Expression;
};

const fillLayer: LayerProps = {
  id: "regions-fill",
  type: "fill",
  paint: {
    "fill-color": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      "#ff6b6b",                  // red   – selected
      ["boolean", ["feature-state", "hover"], false],
      "#ffd93d",                  // yellow – hovered
      buildColorExpression(),     // per-region colour – default
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

const getRegionName = (feature: mapboxgl.MapboxGeoJSONFeature): string =>
  (feature.properties?.name as string | undefined) ?? `Region ${feature.id}`;

interface PopupInfo {
  lngLat: [number, number];
  name: string;
  color: string;
}

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
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const onClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      const regionId = feature.id as number;

      if (selectedRegion !== null) {
        mapRef.current?.setFeatureState(
          { source: "regions", id: selectedRegion },
          { selected: false }
        );
      }

      setSelectedRegion(regionId);
      mapRef.current?.setFeatureState(
        { source: "regions", id: regionId },
        { selected: true }
      );

      navigate(`/chat/${regionId}`);
    },
    [selectedRegion, navigate]
  );

  const onMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (hoveredRegion !== null && hoveredRegion !== selectedRegion) {
        mapRef.current?.setFeatureState(
          { source: "regions", id: hoveredRegion },
          { hover: false }
        );
      }

      if (!feature) {
        setHoveredRegion(null);
        setPopupInfo(null);
        return;
      }

      const regionId = feature.id as number;
      const name = getRegionName(feature);
      const color = REGION_COLORS[name] ?? DEFAULT_COLOR;

      if (regionId !== selectedRegion) {
        setHoveredRegion(regionId);
        mapRef.current?.setFeatureState(
          { source: "regions", id: regionId },
          { hover: true }
        );
      }

      setPopupInfo({
        lngLat: [event.lngLat.lng, event.lngLat.lat],
        name,
        color,
      });
    },
    [hoveredRegion, selectedRegion]
  );

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
          offset={[0, -10] as [number, number]}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* colour swatch matching the region */}
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: popupInfo.color,
                flexShrink: 0,
              }}
            />
            <strong style={{ fontSize: 13 }}>{popupInfo.name}</strong>
          </div>
        </Popup>
      )}
    </Map>
  );
}