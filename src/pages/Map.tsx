import { Map as M } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import VITE_MAPBOX_TOKEN from "../../credentials"

export default function Map() {
    return (
        <>
            <M
                mapboxAccessToken={VITE_MAPBOX_TOKEN}
                initialViewState={{
                    longitude: 19.6,
                    latitude: 55.9,
                    zoom: 3
                }}
                style={{ width: 1920, height: 1080, overflowX: "hidden" }}
                mapStyle="mapbox://styles/mapbox/streets-v9"
            />
        </>
    )
}
