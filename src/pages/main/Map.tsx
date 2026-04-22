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
            [19.0, 47.5], [19.2, 47.5], [19.2, 47.3], [19.0, 47.3], [19.0, 47.5]
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
            [18.5, 48.2], [18.7, 48.2], [18.7, 48.0], [18.5, 48.0], [18.5, 48.2]
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
            [20.5, 47.8], [20.8, 47.8], [20.8, 47.5], [20.5, 47.5], [20.5, 47.8]
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
            [17.5, 46.2], [18.0, 46.2], [18.0, 45.8], [17.5, 45.8], [17.5, 46.2]
        ],
        hazardLevel: 'Critical',
        description: 'Olajvezeték szivárgás, tengeri élőhely veszélyeztetve',
        pollution: '98%',
        hazards: ['Olaj', 'Vízszennyezés']
    }
] as const;

type Zone = typeof DANGER_ZONES[number];

const HAZARD_STYLE: Record<string, { fillColor: string; bg: string; text: string }> = {
    Critical: { fillColor: 'rgba(220, 38, 38, 0.6)',  bg: 'bg-red-100',    text: 'text-red-800'    },
    High:     { fillColor: 'rgba(234, 88, 12, 0.6)',  bg: 'bg-orange-100', text: 'text-orange-800' },
    Medium:   { fillColor: 'rgba(250, 204, 21, 0.6)', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    Low:      { fillColor: 'rgba(34, 197, 94, 0.6)',  bg: 'bg-green-100',  text: 'text-green-800'  },
};

const getHazardStyle = (level: string) => HAZARD_STYLE[level] ?? HAZARD_STYLE.Low;

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

function SearchBar({
    value, onChange, results, onSelect, isDrawing, onStartDrawing, statusMsg,
}: {
    value: string
    onChange: (v: string) => void
    results: Zone[]
    onSelect: (z: Zone) => void
    isDrawing: boolean
    onStartDrawing: () => void
    statusMsg: string | null
}) {
    const hasResults = results.length > 0;
    return (
        <div className={`absolute top-0 left-0 z-20 pt-4 pl-4 transition-all duration-300 w-96`}>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                className={`p-4 w-full border-2 border-gray-500 bg-white focus:outline-none focus:border-blue-500 transition-all duration-200 ${hasResults ? 'rounded-t-2xl rounded-b-none' : 'rounded-full'}`}
                placeholder="Search zones..."
            />

            {hasResults && (
                <div className="bg-white rounded-b-2xl border-2 border-t-0 border-gray-500 shadow-lg max-h-64 overflow-y-auto">
                    {results.map(zone => (
                        <div key={zone.id} className="border-b border-gray-200 last:border-b-0">
                            <button onClick={() => onSelect(zone)} className="w-full px-4 py-2 text-left hover:bg-gray-100 transition">
                                <div className="font-semibold text-sm">{zone.name}</div>
                                <div className="text-xs text-gray-600">{zone.description}</div>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-2 flex gap-2 items-center">
                <button
                    onClick={onStartDrawing}
                    disabled={isDrawing}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none transition ${isDrawing ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    {isDrawing ? 'Drawing...' : 'Draw a polygon'}
                </button>
                {statusMsg && <div className="text-sm text-green-600 font-medium">{statusMsg}</div>}
            </div>
        </div>
    );
}

function ConfirmBar({
    onCancel, onEdit, onConfirm,
}: {
    onCancel: () => void
    onEdit: () => void
    onConfirm: () => void
}) {
    return (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 w-full max-w-2xl px-4">
            <div className="bg-white rounded-full shadow-lg p-3 flex items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="font-medium">Review drawing</div>
                    <div className="text-sm text-gray-600">Accept this zone as is?</div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel}  className="px-3 py-2 bg-gray-200 rounded-full text-sm">Reject</button>
                    <button onClick={onEdit}    className="px-3 py-2 bg-yellow-200 rounded-full text-sm">Edit</button>
                    <button onClick={onConfirm} className="px-3 py-2 bg-green-600 text-white rounded-full text-sm">Accept</button>
                </div>
            </div>
        </div>
    );
}

function SidePanel({
    zone, onClose, onEdit,
}: {
    zone: Zone
    onClose: () => void
    onEdit: (z: Zone) => void
}) {
    const { bg, text } = getHazardStyle(zone.hazardLevel);
    return (
        <div className="absolute top-0 left-0 w-80 h-screen bg-white shadow-2xl z-30 flex flex-col overflow-hidden translate-x-0 opacity-100 transition-all duration-300">
            <div className={`${bg} p-6 flex items-start justify-between shrink-0`}>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{zone.name}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${bg} ${text}`}>
                        {zone.hazardLevel} hazard
                    </span>
                </div>
                <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition shrink-0 ml-2">
                    <X size={24} />
                </button>
                <button onClick={() => onEdit(zone)} className="text-yellow-700 hover:text-yellow-900 transition shrink-0 ml-2 text-sm">
                    Report / Edit
                </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-sm text-gray-700">{zone.description}</p>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pollution level</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: zone.pollution }} />
                        </div>
                        <span className="font-bold text-red-600">{zone.pollution}</span>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Identified hazards</h3>
                    <div className="flex flex-wrap gap-2">
                        {zone.hazards.map(hazard => (
                            <span key={hazard} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">
                                {hazard}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Zone ID: {zone.id}</p>
                </div>
            </div>
        </div>
    );
}

export default function Map() {
    const mapRef = useRef(null);
    const mapboxMapRef = useRef<any>(null);
    const drawRef = useRef<any>(null);
    const isDrawingRef = useRef(false);

    const [searchValue, setSearchValue] = useState('');
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [searchResults, setSearchResults] = useState<Zone[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [pendingFeature, setPendingFeature] = useState<any>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);
    const [editingExistingZone, setEditingExistingZone] = useState<number | null>(null);
    const [originalCoords, setOriginalCoords] = useState<any>(null);

    const debouncedSearch = useDebounce(searchValue, 300);

    useEffect(() => {
        if (debouncedSearch.trim() === '') { setSearchResults([]); return; }
        setSearchResults(
            DANGER_ZONES.filter(zone =>
                zone.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                zone.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                zone.hazards.some(h => h.toLowerCase().includes(debouncedSearch.toLowerCase()))
            )
        );
    }, [debouncedSearch]);

    useEffect(() => { isDrawingRef.current = isDrawing; }, [isDrawing]);

    const resetDraw = () => {
        try {
            const mapInstance = (mapboxMapRef.current as any)?.getMap?.() ?? mapboxMapRef.current;
            if (mapInstance && drawRef.current) mapInstance.removeControl(drawRef.current);
        } catch { /* ignore */ }
        drawRef.current = null;
        setPendingFeature(null);
        setShowConfirm(false);
        setIsDrawing(false);
        setEditingExistingZone(null);
        setOriginalCoords(null);
    };

    const startDrawing = async (existingFeature?: any, existingZoneId?: number) => {
        if (!mapboxMapRef.current || isDrawingRef.current) return;
        setIsDrawing(true);

        try {
            const DrawModule = await import('@mapbox/mapbox-gl-draw');
            const MapboxDraw = (DrawModule as any).default ?? DrawModule;
            const mapInstance = (mapboxMapRef.current as any).getMap?.() ?? mapboxMapRef.current;

            try { (window as any).mapboxgl = mapboxgl; } catch { /* ignore */ }

            if (!drawRef.current) {
                const draw = new (MapboxDraw as any)({ displayControlsDefault: false, controls: { polygon: true, trash: true } });
                drawRef.current = draw;
                mapInstance.addControl(draw);

                mapInstance.on('draw.create', (e: any) => {
                    const feat = e.features?.[0];
                    if (!feat) return;
                    setPendingFeature(feat);
                    setShowConfirm(true);
                });

                mapInstance.on('draw.update', (e: any) => {
                    const feat = e.features?.[0];
                    if (feat) setPendingFeature(feat);
                });
            }

            if (existingFeature) {
                if (!existingFeature.id) existingFeature.id = `existing-${existingZoneId}-${Date.now()}`;
                drawRef.current.add(existingFeature);
                setOriginalCoords(existingFeature.geometry.coordinates);
                setEditingExistingZone(existingZoneId ?? null);
                setPendingFeature(existingFeature);
                setShowConfirm(true);
                try { drawRef.current.changeMode('direct_select', { featureId: existingFeature.id }); } catch { /* ignore */ }
            } else {
                drawRef.current.changeMode('draw_polygon');
            }
        } catch (err) {
            console.error('Failed to load Mapbox Draw:', err);
            resetDraw();
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
            setTimeout(() => setStatusMsg(null), 2500);
        } catch (err) {
            console.error(err);
            setStatusMsg('Hiba a mentés során');
        } finally {
            resetDraw();
        }
    };

    const editPending = () => {
        if (!drawRef.current || !pendingFeature) return;
        try {
            drawRef.current.changeMode('direct_select', { featureId: pendingFeature.id });
        } catch {
            setTimeout(() => {
                try { drawRef.current.changeMode('direct_select', { featureId: pendingFeature.id }); }
                catch (e) { console.error('Failed to enter edit mode on retry:', e); }
            }, 80);
        }
    };

    const cancelPending = () => {
        try { if (drawRef.current && pendingFeature) drawRef.current.delete(pendingFeature.id); }
        catch (err) { console.error('Failed to cancel pending feature:', err); }
        finally { resetDraw(); }
    };

    const startEditingZone = (zone: Zone) => {
        startDrawing(
            { id: `zone-${zone.id}`, type: 'Feature', properties: { id: zone.id }, geometry: { type: 'Polygon', coordinates: [zone.coordinates] } },
            zone.id
        );
    };

    const handleZoneClick = (zone: Zone) => {
        if (isDrawingRef.current) return;
        setSelectedZone(zone);

        const map = mapboxMapRef.current ?? (mapRef.current as any)?.getMap?.() ?? mapRef.current;
        if (!map) return;

        const bounds = zone.coordinates.reduce(
            (b: any, coord) => b.extend(coord as [number, number]),
            new mapboxgl.LngLatBounds(zone.coordinates[0] as [number, number], zone.coordinates[0] as [number, number])
        );
        map.fitBounds(bounds, { padding: 100, duration: 800 });
    };

    const handleMapLoad = (event: any) => {
        const map = event.target;
        mapboxMapRef.current = map;

        DANGER_ZONES.forEach(zone => {
            const sourceId = `source-zone-${zone.id}`;
            const layerId  = `zone-${zone.id}`;
            if (map.getSource(sourceId)) return;

            const { fillColor } = getHazardStyle(zone.hazardLevel);
            const solidColor    = fillColor.replace('0.6)', '1)');

            map.addSource(sourceId, {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [zone.coordinates] }, properties: { id: zone.id } }
            });
            map.addLayer({ id: layerId,           type: 'fill', source: sourceId, paint: { 'fill-color': fillColor, 'fill-opacity': 0.6 } });
            map.addLayer({ id: `${layerId}-border`, type: 'line', source: sourceId, paint: { 'line-color': solidColor, 'line-width': 3 } });

            map.on('click',      layerId, () => handleZoneClick(zone));
            map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
        });
    };

    return (
        <>
            <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                results={selectedZone ? [] : searchResults}
                onSelect={handleZoneClick}
                isDrawing={isDrawing}
                onStartDrawing={() => startDrawing()}
                statusMsg={statusMsg}
            />

            <M
                ref={mapRef}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                initialViewState={{ longitude: 19.6, latitude: 55.9, zoom: 3 }}
                style={{ width: '100vw', height: '100vh', overflowX: 'hidden', zIndex: 10 }}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                onLoad={handleMapLoad}
            />

            {showConfirm && pendingFeature && (
                <ConfirmBar onCancel={cancelPending} onEdit={editPending} onConfirm={confirmPending} />
            )}

            {selectedZone && (
                <SidePanel zone={selectedZone} onClose={() => setSelectedZone(null)} onEdit={startEditingZone} />
            )}
        </>
    );
}