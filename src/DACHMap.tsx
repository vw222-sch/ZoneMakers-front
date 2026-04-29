import { useState, useCallback, useRef } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/mapbox";
import type { MapRef, LayerProps, MapMouseEvent } from "react-map-gl/mapbox";
import { useNavigate } from "react-router";
import "mapbox-gl/dist/mapbox-gl.css";

import MY_GEOJSON from "./GALS.json";

const REGION_COLORS: Record<string, string> = {
  "Nordic Region": "#16D8FA",
  "Mediterranean Region": "#008C45",
  "New World Region": "#1CCD92",
  "Iberian Region": "#F1BF00",
  "British Isles Region": "#C8102E",
  "Visegrad Region": "#6C3BAA",
  "Germanic Region": "#7EB8C9",
  "Baltic Region": "#6CD405",
  "French Region": "#318CE7",
  "Pan-Slavic Region": "#E8A0E8",
  "Black Sea Region": "#B87333",
  "Ex-Yugoslavian Region": "#FF4500",
  "Benelux Region": "#CE009B",
};
const DEFAULT_COLOR = "#FFFFFF"; // white fallback for any regions not in the map above

// Format ["case", ["==", ["get", "name"], "Region A"], "#4cc9f0", ... fallback]
const buildColorExpression = (): mapboxgl.Expression => {
  const cases: unknown[] = ["case"];
  for (const [name, color] of Object.entries(REGION_COLORS)) {
    cases.push(["==", ["get", "name"], name], color);
  }
  cases.push(DEFAULT_COLOR);
  return cases as mapboxgl.ExpressionSpecification;
};

const fillLayer: LayerProps = {
  id: "regions-fill",
  type: "fill",
  paint: {
    "fill-color": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      "#ff6b6b",
      ["boolean", ["feature-state", "hover"], false],
      "#BBBBBB",
      buildColorExpression(),
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      0.9,
      ["boolean", ["feature-state", "hover"], false],
      0.85,
      0.55,
    ],
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

const getRegionName = (feature: mapboxgl.GeoJSONFeature): string =>
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
    (event: MapMouseEvent) => {
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
    (event: MapMouseEvent) => {
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
      <Source id="regions" type="geojson" data={MY_GEOJSON as unknown as GeoJSON.FeatureCollection} generateId>
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
          <div className="flex items-center gap-2">
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: popupInfo.color,
                flexShrink: 0,
              }}
            />
            <strong className="text-black text-sm">{popupInfo.name}</strong>
          </div>
        </Popup>
      )}
    </Map>
  );
}