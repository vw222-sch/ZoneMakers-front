import { Map as M } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import VITE_MAPBOX_TOKEN from "../../credentials"

export default function Map() {
    return (
        <>
            <div className='absolute bottom-0 left-0 h-screen w-100 bg-white z-11 px-4 py-8'>
                <h1 className='text-4xl text-center mb-8 font-semibold tracking-wide'>Search Anywhere!</h1>
                <input type="text" className='p-4 rounded-2xl w-full border-2' placeholder='Search...' />

                <div className='mt-12 h-fit rounded-2xl border-2 p-4 space-y-4'>
                    <h1 className='text-2xl font-semibold tracking-wide'>Recommended places:</h1>

                    <div className='rounded-2xl border-2 h-40'></div>
                </div>

                <div className='mt-4 h-fit rounded-2xl border-2 p-4 space-y-4'>
                    <h1 className='text-2xl font-semibold tracking-wide'>Hotels:</h1>

                    <div className='rounded-2xl border-2 h-40'></div>
                </div>
            </div>
            <M
                mapboxAccessToken={VITE_MAPBOX_TOKEN}
                initialViewState={{
                    longitude: 19.6,
                    latitude: 55.9,
                    zoom: 3
                }}
                style={{ width: "100vw", height: "100vh", overflowX: "hidden", zIndex: 10 }}
                mapStyle="mapbox://styles/mapbox/streets-v9"
            />
        </>
    )
}
