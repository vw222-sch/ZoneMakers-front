import { useEffect, useRef, useState } from 'react';
import { Map as M } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { X } from 'lucide-react';

const DANGER_ZONES = [
    {
        id: 1,
        name: 'Dunai Ipari Terület',
        coordinates: [
            [19.0, 47.5],
            [19.2, 47.5],
            [19.2, 47.3],
            [19.0, 47.3],
            [19.0, 47.5]
        ],
        hazardLevel: 'High',
        description: 'Ipari vegyszerek tárolása, fokozott levegőszennyezés',
        pollution: '85%',
        hazards: ['Vegyszerek', 'Füst']
    },
    {
        id: 2,
        name: 'Erőmű Közelében',
        coordinates: [
            [18.5, 48.2],
            [18.7, 48.2],
            [18.7, 48.0],
            [18.5, 48.0],
            [18.5, 48.2]
        ],
        hazardLevel: 'Medium',
        description: 'Radioaktív sugárzás az erőmű körül',
        pollution: '45%',
        hazards: ['Sugárzás', 'Hő']
    },
    {
        id: 3,
        name: 'Hulladéklerakó',
        coordinates: [
            [20.5, 47.8],
            [20.8, 47.8],
            [20.8, 47.5],
            [20.5, 47.5],
            [20.5, 47.8]
        ],
        hazardLevel: 'High',
        description: 'Veszélyes hulladék lerakóhely, biohazárd terület',
        pollution: '92%',
        hazards: ['Biohazárd', 'Metán']
    },
    {
        id: 4,
        name: 'Tengeri Olajszennyezés',
        coordinates: [
            [17.5, 46.2],
            [18.0, 46.2],
            [18.0, 45.8],
            [17.5, 45.8],
            [17.5, 46.2]
        ],
        hazardLevel: 'Critical',
        description: 'Olajvezeték szivárgás, tengeri élőhely veszélyeztetve',
        pollution: '98%',
        hazards: ['Olaj', 'Vízszennyezés']
    }
];

// Debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

export default function Map() {
    const mapRef = useRef(null);
    // Reference to the underlying Mapbox GL JS map instance (used for fitBounds)
    const mapboxMapRef = useRef<any>(null);
    const [searchValue, setSearchValue] = useState('');
    const [selectedZone, setSelectedZone] = useState<typeof DANGER_ZONES[0] | null>(null);
    const [searchResults, setSearchResults] = useState<typeof DANGER_ZONES>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const drawRef = useRef<any>(null);
    const isDrawingRef = useRef(false);
    const [pendingFeature, setPendingFeature] = useState<any>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);
    const [editingExistingZone, setEditingExistingZone] = useState<number | null>(null);
    const [originalCoords, setOriginalCoords] = useState<any>(null);

    const debouncedSearch = useDebounce(searchValue, 300);

    // Manage search
    useEffect(() => {
        if (debouncedSearch.trim() === '') {
            setSearchResults([]);
            return;
        }

        const results = DANGER_ZONES.filter(zone =>
            zone.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            zone.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            zone.hazards.some(h => h.toLowerCase().includes(debouncedSearch.toLowerCase()))
        );

        setSearchResults(results);
    }, [debouncedSearch]);

    useEffect(() => {
        isDrawingRef.current = isDrawing;
    }, [isDrawing]);

    // Start Mapbox Draw polygon drawing mode (dynamically imported).
    // If existingFeature is provided, it will be loaded for editing (report flow).
    const startDrawing = async (existingFeature?: any, existingZoneId?: number) => {
        const rawMap = mapboxMapRef.current;
        if (!rawMap || isDrawingRef.current) return;

        setIsDrawing(true);

        try {
            const DrawModule = await import('@mapbox/mapbox-gl-draw');
            const MapboxDraw = (DrawModule && (DrawModule as any).default) || DrawModule;

            const mapInstance = (rawMap as any).getMap?.() || rawMap;

            try { (window as any).mapboxgl = mapboxgl; } catch (e) { /* ignore */ }

            if (!drawRef.current) {
                const draw = new (MapboxDraw as any)({ displayControlsDefault: false, controls: { polygon: true, trash: true } });
                drawRef.current = draw;
                mapInstance.addControl(draw);

                // create
                mapInstance.on('draw.create', (e: any) => {
                    const feat = e.features && e.features[0];
                    if (!feat) return;
                    setPendingFeature(feat);
                    setShowConfirm(true);
                });

                // update
                mapInstance.on('draw.update', (e: any) => {
                    const feat = e.features && e.features[0];
                    if (!feat) return;
                    setPendingFeature(feat);
                });
            }

            if (existingFeature) {
                try {
                    // ensure feature has an id
                    if (!existingFeature.id) existingFeature.id = `existing-${existingZoneId}-${Date.now()}`;
                    drawRef.current.add(existingFeature);
                    setOriginalCoords(existingFeature.geometry.coordinates);
                    setEditingExistingZone(existingZoneId ?? null);
                    // set as pending and open confirmation so user can choose to edit
                    setPendingFeature(existingFeature);
                    setShowConfirm(true);
                    // attempt to enter direct_select so the user can immediately edit
                    try { drawRef.current.changeMode('direct_select', { featureId: existingFeature.id }); } catch (e) { /* ignore */ }
                } catch (err) {
                    console.error('Failed to load existing feature into draw:', err);
                }
            } else {
                drawRef.current.changeMode('draw_polygon');
            }
        } catch (err) {
            console.error('Failed to load Mapbox Draw:', err);
            setIsDrawing(false);
            setShowConfirm(false);
        }
    };

    const confirmPending = () => {
        try {
            if (!drawRef.current || !pendingFeature) return;
            const coords = pendingFeature.geometry.coordinates;
            if (editingExistingZone != null) {
                console.log('Modify existing zone', editingExistingZone, 'original:', originalCoords, 'modified:', coords);
            } else {
                console.log('New polygon coords:', coords);
            }
            setStatusMsg('Sikeres mentés');
        } catch (err) {
            console.error(err);
            setStatusMsg('Hiba a mentés során');
        } finally {
            try { const mapInstance = (mapboxMapRef.current as any).getMap?.() || mapboxMapRef.current; if (mapInstance && drawRef.current) { mapInstance.removeControl(drawRef.current); } } catch (e) {}
            drawRef.current = null;
            setPendingFeature(null);
            setShowConfirm(false);
            setIsDrawing(false);
            setEditingExistingZone(null);
            setOriginalCoords(null);
            setTimeout(() => setStatusMsg(null), 2500);
        }
    };

    const editPending = () => {
        if (!drawRef.current || !pendingFeature) return;
        try {
            // try immediate changeMode, if Draw isn't ready retry shortly
            try { drawRef.current.changeMode('direct_select', { featureId: pendingFeature.id }); }
            catch (err) {
                setTimeout(() => {
                    try { drawRef.current.changeMode('direct_select', { featureId: pendingFeature.id }); } catch (e) { console.error('Failed to enter edit mode on retry:', e); }
                }, 80);
            }
        } catch (err) {
            console.error('Failed to enter edit mode:', err);
        }
    };

    const cancelPending = () => {
        try {
            if (drawRef.current && pendingFeature) {
                drawRef.current.delete(pendingFeature.id);
            }
        } catch (err) {
            console.error('Failed to cancel pending feature:', err);
        } finally {
            try { const mapInstance = (mapboxMapRef.current as any).getMap?.() || mapboxMapRef.current; if (mapInstance && drawRef.current) { mapInstance.removeControl(drawRef.current); } } catch (e) {}
            drawRef.current = null;
            setPendingFeature(null);
            setShowConfirm(false);
            setIsDrawing(false);
            setEditingExistingZone(null);
            setOriginalCoords(null);
        }
    };

    const startEditingZone = (zone: typeof DANGER_ZONES[0]) => {
        const feature = {
            id: `zone-${zone.id}`,
            type: 'Feature',
            properties: { id: zone.id },
            geometry: { type: 'Polygon', coordinates: [zone.coordinates] }
        };
        startDrawing(feature, zone.id);
    };

    const handleZoneClick = (zone: typeof DANGER_ZONES[0]) => {
        // If currently drawing, don't open side panel (user may be creating inside an area)
        if (isDrawingRef.current) return;

        setSelectedZone(zone);

        // Zoom rá a zónára
        if (mapRef.current) {
            // Prefer the actual Mapbox GL JS map instance saved on load
            const map = mapboxMapRef.current || (mapRef.current as any).getMap?.() || mapRef.current;

            if (map) {
                // Build bounds from polygon coordinates
                const bounds = zone.coordinates.reduce(
                    (bounds: any, coord) => bounds.extend(coord as [number, number]),
                    new mapboxgl.LngLatBounds(zone.coordinates[0] as [number, number], zone.coordinates[0] as [number, number])
                );

                map.fitBounds(bounds, { padding: 100, duration: 800 });
            }
        }
    };

    const getHazardColor = (hazardLevel: string) => {
        switch (hazardLevel) {
            case 'Critical':
                return 'rgba(220, 38, 38, 0.6)'; // Red
            case 'High':
                return 'rgba(234, 88, 12, 0.6)'; // Orange
            case 'Medium':
                return 'rgba(250, 204, 21, 0.6)'; // Yellow
            default:
                return 'rgba(34, 197, 94, 0.6)'; // Green
        }
    };

    const getHazardBgColor = (hazardLevel: string) => {
        switch (hazardLevel) {
            case 'Critical':
                return 'bg-red-100';
            case 'High':
                return 'bg-orange-100';
            case 'Medium':
                return 'bg-yellow-100';
            default:
                return 'bg-green-100';
        }
    };

    const getHazardTextColor = (hazardLevel: string) => {
        switch (hazardLevel) {
            case 'Critical':
                return 'text-red-800';
            case 'High':
                return 'text-orange-800';
            case 'Medium':
                return 'text-yellow-800';
            default:
                return 'text-green-800';
        }
    };

    return (
        <>
            {/* Search Input - Top Left */}
            <div className={`absolute top-0 left-0 z-20 pt-4 pl-4 transition-all duration-300 ${selectedZone ? 'w-80' : 'w-96'}`}>
                <div className='flex gap-2 items-center'>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className={`p-4 w-full border-2 border-gray-500 bg-white focus:outline-none focus:border-blue-500 transition-all duration-200 ${searchResults.length > 0 ? 'rounded-t-2xl rounded-b-none' : 'rounded-full'}`}
                            placeholder='Search zones...'
                    />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && !selectedZone && (
                    <div className='bg-white rounded-b-2xl border-2 border-t-0 border-gray-500 shadow-lg max-h-64 overflow-y-auto'>
                        {searchResults.map(zone => (
                            <div key={zone.id} className='border-b border-gray-200 last:border-b-0'>
                                <button
                                    onClick={() => handleZoneClick(zone)}
                                    className='w-full px-4 py-2 text-left hover:bg-gray-100 transition'
                                >
                                    <div className='font-semibold text-sm'>{zone.name}</div>
                                    <div className='text-xs text-gray-600'>{zone.description}</div>
                                </button>
                                
                            </div>
                        ))}
                    </div>
                )}

                <div className='mt-2 flex gap-2 items-center'>
                    <button
                        onClick={() => startDrawing()}
                        disabled={isDrawing}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none transition ${isDrawing ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title='Új polygon rajzolása'
                    >
                        {isDrawing ? 'Drawing...' : 'Draw a polygon'}
                    </button>
                    {statusMsg && <div className='text-sm text-green-600 font-medium'>{statusMsg}</div>}
                </div>
            </div>

            {/* Térkép */}
            <M
                ref={mapRef}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                initialViewState={{
                    longitude: 19.6,
                    latitude: 55.9,
                    zoom: 3
                }}
                style={{ width: "100vw", height: "100vh", overflowX: "hidden", zIndex: 10 }}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                onLoad={(event) => {
                    const map = event.target;
                    // Save underlying Mapbox GL JS map instance for later programmatic control
                    mapboxMapRef.current = map;

                    // Add GeoJSON polygons
                    DANGER_ZONES.forEach(zone => {
                        const geoJSON = {
                            type: 'geojson' as const,
                            data: {
                                type: 'Feature' as const,
                                geometry: {
                                    type: 'Polygon' as const,
                                    coordinates: [zone.coordinates]
                                },
                                properties: {
                                    id: zone.id
                                }
                            }
                        };

                        const layerId = `zone-${zone.id}`;
                        const sourceId = `source-zone-${zone.id}`;

                        if (!map.getSource(sourceId)) {
                            map.addSource(sourceId, geoJSON);

                            // Add a layer with a fill
                            map.addLayer({
                                id: layerId,
                                type: 'fill',
                                source: sourceId,
                                paint: {
                                    'fill-color': getHazardColor(zone.hazardLevel),
                                    'fill-opacity': 0.6
                                }
                            });

                            // Border layer
                            map.addLayer({
                                id: `${layerId}-border`,
                                type: 'line',
                                source: sourceId,
                                paint: {
                                    'line-color': getHazardColor(zone.hazardLevel).replace('0.6', '1'),
                                    'line-width': 3
                                }
                            });

                            // Click handler
                            map.on('click', layerId, () => {
                                handleZoneClick(zone);
                            });

                            // Cursor change
                            map.on('mouseenter', layerId, () => {
                                map.getCanvas().style.cursor = 'pointer';
                            });
                            map.on('mouseleave', layerId, () => {
                                map.getCanvas().style.cursor = '';
                            });
                        }
                    });
                }}
            />

            {/* Compact bottom confirmation bar */}
            {showConfirm && pendingFeature && (
                <div className='fixed left-1/2 -translate-x-1/2 bottom-6 z-50 w-full max-w-2xl px-4'>
                    <div className='bg-white rounded-full shadow-lg p-3 flex items-center justify-between gap-4'>
                        <div className='flex-1'>
                            <div className='font-medium'>Review drawing</div>
                            <div className='text-sm text-gray-600'>Accept this zone as is?</div>
                        </div>
                        <div className='flex gap-2'>
                            <button onClick={cancelPending} className='px-3 py-2 bg-gray-200 rounded-full text-sm'>Reject</button>
                            <button onClick={editPending} className='px-3 py-2 bg-yellow-200 rounded-full text-sm'>Edit</button>
                            <button onClick={confirmPending} className='px-3 py-2 bg-green-600 text-white rounded-full text-sm'>Accept</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Side Panel - Left side */}
            {selectedZone && (
                <div className={`absolute top-0 left-0 w-80 h-screen bg-white shadow-2xl z-30 flex flex-col overflow-hidden transition-all duration-300 transform ${selectedZone ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
                    {/* Header */}
                    <div className={`${getHazardBgColor(selectedZone.hazardLevel)} p-6 flex items-start justify-between shrink-0`}>
                        <div className='flex-1'>
                            <h2 className='text-xl font-bold text-gray-900'>{selectedZone.name}</h2>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getHazardBgColor(selectedZone.hazardLevel)} ${getHazardTextColor(selectedZone.hazardLevel)}`}>
                                {selectedZone.hazardLevel} hazard
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedZone(null)}
                            className='text-gray-600 hover:text-gray-900 transition shrink-0 ml-2'
                        >
                            <X size={24} />
                        </button>
                            <button
                                onClick={() => selectedZone && startEditingZone(selectedZone)}
                                className='text-yellow-700 hover:text-yellow-900 transition shrink-0 ml-2 text-sm'
                            >
                                Report / Edit
                            </button>
                    </div>

                    {/* Content */}
                    <div className='p-6 space-y-6 overflow-y-auto flex-1'>
                        {/* Description */}
                        <div>
                            <h3 className='font-semibold text-gray-900 mb-2'>Description</h3>
                            <p className='text-sm text-gray-700'>{selectedZone.description}</p>
                        </div>

                        {/* Pollution level */}
                        <div>
                            <h3 className='font-semibold text-gray-900 mb-2'>Pollution level</h3>
                            <div className='flex items-center gap-3'>
                                <div className='flex-1 bg-gray-200 rounded-full h-2'>
                                    <div
                                        className='bg-red-500 h-2 rounded-full transition-all duration-500'
                                        style={{ width: selectedZone.pollution }}
                                    />
                                </div>
                                <span className='font-bold text-red-600'>{selectedZone.pollution}</span>
                            </div>
                        </div>

                        {/* Hazards */}
                        <div>
                            <h3 className='font-semibold text-gray-900 mb-3'>Identified hazards</h3>
                            <div className='flex flex-wrap gap-2'>
                                {selectedZone.hazards.map((hazard, idx) => (
                                    <span
                                        key={idx}
                                        className='px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium'
                                    >
                                        {hazard}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Zone ID */}
                        <div className='pt-4 border-t border-gray-200'>
                            <p className='text-xs text-gray-500'>Zone ID: {selectedZone.id}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
