import { useState, useCallback, useRef } from "react";
import Map, { Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef, LayerProps } from "react-map-gl/mapbox";
import type { FeatureCollection } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";

import MY_GEOJSON from "./GALS.json"
//import MY_GEOJSON from "../selected.json"

const fillLayer: LayerProps = {
  id: "regions-fill",
  type: "fill",
  paint: {
    "fill-color": "#1d3557",
    "fill-opacity": 0.5,
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



export default function GeoJSONMap() {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    longitude: 10.0,
    latitude: 51.0,
    zoom: 5,
  });

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
    >
      <NavigationControl position="bottom-right" />

      <Source id="regions" type="geojson" data={MY_GEOJSON} generateId>
        <Layer {...fillLayer} />
        <Layer {...lineLayer} />
      </Source>
    </Map>
  );
}
