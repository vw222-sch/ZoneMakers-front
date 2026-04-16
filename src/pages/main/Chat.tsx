import 'mapbox-gl/dist/mapbox-gl.css';
import DACHMap from "@/DACHMap.tsx"
import { Link } from 'react-router';

import { MapPinned } from 'lucide-react';

export default function Chat() {
  return (
    <div>
      <h1 className='fixed top-4 left-4 right-0 text-white text-2xl z-10 font-extrabold tracking-wide'>
        <Link to="/" className='flex items-center gap-2'>
          <MapPinned size={35} />
          ZoneMakers
        </Link>
      </h1>
      <DACHMap />
    </div >
  )
}
