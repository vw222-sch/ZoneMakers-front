import { useEffect, useReducer, useRef, useState, useCallback } from 'react';
import { Map as M } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Save } from 'lucide-react';

import type { ZoneSummary, ZoneFull, CreateReportPayload } from '@/types';
import * as zoneService from '@/services/zoneService';
import * as reportService from '@/services/reportService';
import { getErrorMessage } from '@/lib/api';
import { useAuth } from '@/hooks/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea'

// Átalakítva áttetsző/szemantikus színekre, hogy dark és light módban is jól mutassanak
const HAZARD_STYLE: Record<string, { fillColor: string; bg: string; text: string }> = {
    Critical: { fillColor: 'rgba(220, 38, 38, 0.6)', bg: 'bg-red-500/20', text: 'text-red-500' },
    High: { fillColor: 'rgba(234, 88, 12, 0.6)', bg: 'bg-orange-500/20', text: 'text-orange-500' },
    Medium: { fillColor: 'rgba(250, 204, 21, 0.6)', bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
    Low: { fillColor: 'rgba(34, 197, 94, 0.6)', bg: 'bg-green-500/20', text: 'text-green-500' },
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

const parseHazards = (hazards: string[] | string | null | undefined): string[] => {
    if (!hazards) return [];
    if (Array.isArray(hazards)) return hazards.map(h => String(h).trim());
    if (typeof hazards === 'string') {
        try {
            const parsed = JSON.parse(hazards);
            return Array.isArray(parsed) ? parsed.map((h: any) => String(h).trim()) : hazards.split(',');
        } catch {
            return hazards.split(',');
        }
    }
    return [];
};

type SearchBarProps = {
    value: string;
    onChange: (v: string) => void;
    results: ZoneSummary[];
    onSelect: (zone: ZoneSummary) => void;
    isDrawing: boolean;
    onStartDrawing: () => void;
    statusMsg: string | null;
};

function SearchBar({ value, onChange, results, onSelect, isDrawing, onStartDrawing, statusMsg }: SearchBarProps) {
    const hasResults = results.length > 0;
    return (
        <div className="absolute top-0 left-0 z-20 pt-4 pl-4 transition-all duration-300 w-96">
            <Input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                /* Kőkeményen kikényszerítjük a világos stílust az Input-on is */
                className={`p-4 h-auto transition-all duration-200 bg-white dark:bg-white text-black dark:text-black border-gray-300 dark:border-gray-300 placeholder:text-gray-500 shadow-2xl focus-visible:ring-gray-400 ${hasResults ? 'rounded-t-2xl rounded-b-none' : 'rounded-full'}`}
                placeholder="Search between zones..."
            />
            
            {hasResults && (
                <div className="bg-white dark:bg-white rounded-b-2xl border-x border-b border-gray-300 dark:border-gray-300 shadow-lg max-h-64 overflow-y-auto">
                    {results.map((zone) => (
                        /* Sima natív HTML button a shadcn <Button> helyett, így nincs téma-ütközés */
                        <button
                            key={zone.id}
                            type="button"
                            onClick={() => onSelect(zone)}
                            className="w-full flex flex-col justify-start text-left px-4 py-3 bg-white dark:bg-white hover:bg-gray-100 dark:hover:bg-gray-100 border-b border-gray-200 dark:border-gray-200 last:border-b-0 transition-colors cursor-pointer"
                        >
                            <span className="font-bold text-sm text-black dark:text-black">
                                {zone.name}
                            </span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-500">
                                {zone.hazard_level} hazard level
                            </span>
                        </button>
                    ))}
                </div>
            )}
            
            <div className="mt-2 flex gap-2 items-center">
                <Button
                    variant="secondary"
                    onClick={onStartDrawing}
                    disabled={isDrawing}
                    className={`rounded-full transition shadow-md ${isDrawing ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    {isDrawing ? 'Drawing in progress...' : 'Select New Zone'}
                </Button>
                {statusMsg && (
                    <div className="text-sm text-green-700 dark:text-green-700 font-bold bg-white dark:bg-white border border-gray-200 dark:border-gray-200 px-3 py-1 rounded-full shadow-md">
                        {statusMsg}
                    </div>
                )}
            </div>
        </div>
    );
}

type ReportState = {
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    success: boolean;
};
const initialReportState: ReportState = { isOpen: false, isLoading: false, error: null, success: false };

type DrawState = {
    isDrawing: boolean;
    pendingFeature: GeoJSON.Feature<GeoJSON.Polygon> | null;
    showConfirm: boolean;
    showZoneForm: boolean;
    newZoneData: { name: string; description: string; hazard_level: string; hazards: string };
};

type DrawAction =
    | { type: 'SET_DRAWING'; payload: boolean }
    | { type: 'SET_PENDING_FEATURE'; payload: GeoJSON.Feature<GeoJSON.Polygon> | null }
    | { type: 'SET_SHOW_CONFIRM'; payload: boolean }
    | { type: 'SET_SHOW_FORM'; payload: boolean }
    | { type: 'UPDATE_FORM_DATA'; payload: Partial<DrawState['newZoneData']> }
    | { type: 'RESET_DRAW' };

const initialDrawState: DrawState = {
    isDrawing: false,
    pendingFeature: null,
    showConfirm: false,
    showZoneForm: false,
    newZoneData: { name: '', description: '', hazard_level: 'Low', hazards: '' },
};

const drawReducer = (state: DrawState, action: DrawAction): DrawState => {
    switch (action.type) {
        case 'SET_DRAWING': return { ...state, isDrawing: action.payload };
        case 'SET_PENDING_FEATURE': return { ...state, pendingFeature: action.payload };
        case 'SET_SHOW_CONFIRM': return { ...state, showConfirm: action.payload };
        case 'SET_SHOW_FORM': return { ...state, showZoneForm: action.payload };
        case 'UPDATE_FORM_DATA': return { ...state, newZoneData: { ...state.newZoneData, ...action.payload } };
        case 'RESET_DRAW': return { ...initialDrawState };
        default: return state;
    }
};

export default function Map() {
    const mapRef = useRef(null);
    const mapboxMapRef = useRef<mapboxgl.Map | null>(null);
    const drawRef = useRef<any>(null);
    const isDrawingRef = useRef(false);
    const fetchIdRef = useRef(0);

    const { state: authState } = useAuth();
    const isLoggedIn = authState.isLoggedIn;

    const [zoneSummaries, setZoneSummaries] = useState<ZoneSummary[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<ZoneSummary[]>([]);

    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
    const [selectedZone, setSelectedZone] = useState<ZoneFull | null>(null);
    const [isLoadingZone, setIsLoadingZone] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    const [reportState, setReportState] = useState<ReportState>(initialReportState);
    const [reportReason, setReportReason] = useState('');

    const [drawState, dispatch] = useReducer(drawReducer, initialDrawState);
    const debouncedSearch = useDebounce(searchValue, 300);

    const fetchZoneSummaries = useCallback(async () => {
        try {
            const zones = await zoneService.fetchZoneSummaries();
            setZoneSummaries(zones);
        } catch (error) {
            console.error("Hiba a zónák letöltésekor:", getErrorMessage(error));
        }
    }, []);

    useEffect(() => {
        if (debouncedSearch.trim() === '') {
            setSearchResults([]);
            return;
        }
        const searchZones = async () => {
            try {
                const zones = await zoneService.searchZones(debouncedSearch);
                setSearchResults(zones);
            } catch (error) {
                console.error("Keresési hiba:", getErrorMessage(error));
            }
        };
        searchZones();
    }, [debouncedSearch]);

    useEffect(() => { isDrawingRef.current = drawState.isDrawing; }, [drawState.isDrawing]);

    const fetchZoneDetails = useCallback(async (id: number) => {
        setIsLoadingZone(true);
        setSelectedZone(null);
        const currentFetchId = ++fetchIdRef.current;

        try {
            const fullZone = await zoneService.fetchZoneDetails(id);
            if (currentFetchId === fetchIdRef.current) {
                setSelectedZone(fullZone);
            }
        } catch (error) {
            console.error("Hiba a zóna részleteinek betöltésekor:", getErrorMessage(error));
            if (currentFetchId === fetchIdRef.current) {
                setSelectedZoneId(null);
            }
        } finally {
            if (currentFetchId === fetchIdRef.current) {
                setIsLoadingZone(false);
            }
        }
    }, []);

    const handleZoneClick = useCallback((id: number, coordinates: number[][]) => {
        if (isDrawingRef.current) return;

        setSelectedZoneId(id);
        const map = mapboxMapRef.current;
        if (!map || !coordinates || coordinates.length === 0) return;

        const bounds = coordinates.reduce(
            (b: any, coord) => b.extend(coord as [number, number]),
            new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
        );
        map.fitBounds(bounds, { padding: 100, duration: 800 });

        fetchZoneDetails(id);
    }, [fetchZoneDetails]);

    useEffect(() => {
        const map = mapboxMapRef.current;
        if (!map || !map.isStyleLoaded()) return;

        zoneSummaries.forEach(zone => {
            if (!zone.coordinates || zone.coordinates.length === 0) return;
            const sourceId = `source-zone-${zone.id}`;
            const layerId = `zone-${zone.id}`;

            if (!map.getSource(sourceId)) {
                const { fillColor } = getHazardStyle(zone.hazard_level);
                const solidColor = fillColor.replace('0.6)', '1)');

                map.addSource(sourceId, {
                    type: 'geojson',
                    data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [zone.coordinates] }, properties: { id: zone.id } }
                });
                map.addLayer({ id: layerId, type: 'fill', source: sourceId, paint: { 'fill-color': fillColor, 'fill-opacity': 0.6 } });
                map.addLayer({ id: `${layerId}-border`, type: 'line', source: sourceId, paint: { 'line-color': solidColor, 'line-width': 3 } });

                map.on('click', layerId, () => handleZoneClick(zone.id, zone.coordinates));
                map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
            }
        });
    }, [zoneSummaries, handleZoneClick]);

    const closeSidePanel = () => {
        setSelectedZoneId(null);
        setSelectedZone(null);
        setIsLoadingZone(false);
    };

    const handleReportSubmit = async () => {
        if (!selectedZoneId || !reportReason.trim()) return;

        setReportState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const payload: CreateReportPayload = {
                reason: reportReason,
                report_id: selectedZoneId.toString(),
            };

            await reportService.reportZone(payload);

            setReportState({ isOpen: false, isLoading: false, error: null, success: true });
            setReportReason('');

            setTimeout(() => setReportState(prev => ({ ...prev, success: false })), 3000);
        } catch (err) {
            setReportState(prev => ({
                ...prev,
                isLoading: false,
                error: getErrorMessage(err)
            }));
        }
    };

    const resetDraw = () => {
        try {
            const mapInstance = mapboxMapRef.current;
            if (mapInstance && drawRef.current) mapInstance.removeControl(drawRef.current);
        } catch (e) {
            console.warn("Hiba a Draw kontrol eltávolításakor:", e);
        }
        drawRef.current = null;
        dispatch({ type: 'RESET_DRAW' });
    };

    const startDrawing = async () => {
        if (!mapboxMapRef.current || isDrawingRef.current) return;

        if (!isLoggedIn) {
            setStatusMsg('Hiba: Be kell jelentkezned a rajzoláshoz!');
            setTimeout(() => setStatusMsg(null), 3000);
            return;
        }

        dispatch({ type: 'SET_DRAWING', payload: true });

        try {
            const DrawModule = await import('@mapbox/mapbox-gl-draw');
            const MapboxDraw = (DrawModule as any).default ?? DrawModule;
            const mapInstance = mapboxMapRef.current;

            if (!drawRef.current) {
                const draw = new (MapboxDraw as any)({ displayControlsDefault: false, controls: { polygon: true, trash: true } });
                drawRef.current = draw;
                mapInstance.addControl(draw);

                mapInstance.on('draw.create', (e: any) => {
                    const feat = e.features?.[0];
                    if (feat) {
                        dispatch({ type: 'SET_PENDING_FEATURE', payload: feat });
                        dispatch({ type: 'SET_SHOW_CONFIRM', payload: true });
                    }
                });
            }
            drawRef.current.changeMode('draw_polygon');
        } catch (err) {
            console.error('Failed to load Mapbox Draw:', err);
            resetDraw();
        }
    };

    const submitNewZone = async () => {
        if (!drawState.pendingFeature) return;
        try {
            const coords = drawState.pendingFeature.geometry.coordinates[0];
            const payload = {
                name: drawState.newZoneData.name,
                coordinates: JSON.stringify(coords),
                hazard_level: drawState.newZoneData.hazard_level,
                description: drawState.newZoneData.description,
                hazards: JSON.stringify(drawState.newZoneData.hazards.split(',').map(h => h.trim()).filter(h => h)),
                images: "[]"
            };

            await zoneService.createZoneRequest(payload);

            setStatusMsg('Zóna kérelem sikeresen elküldve!');
            setTimeout(() => setStatusMsg(null), 3000);
            fetchZoneSummaries();
        } catch (err) {
            console.error(err);
            setStatusMsg('Hiba a mentés során: ' + getErrorMessage(err));
        } finally {
            resetDraw();
        }
    };

    const parsedHazards = parseHazards(selectedZone?.hazards);

    return (
        <>
            <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                results={selectedZoneId !== null ? [] : searchResults}
                onSelect={(zone) => handleZoneClick(zone.id, zone.coordinates)}
                isDrawing={drawState.isDrawing}
                onStartDrawing={startDrawing}
                statusMsg={statusMsg}
            />

            <M
                ref={mapRef}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                initialViewState={{ longitude: 19.6, latitude: 47.1, zoom: 6 }}
                style={{ width: '100vw', height: '100vh', overflowX: 'hidden', zIndex: 10 }}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                onLoad={(e) => {
                    mapboxMapRef.current = e.target;
                    fetchZoneSummaries();
                }}
            />

            <Sheet open={selectedZoneId !== null || isLoadingZone} onOpenChange={(open) => { if (!open) closeSidePanel(); }}>
                <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                    {isLoadingZone ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) : selectedZone ? (
                        <>
                            <SheetHeader className="bg-muted/50 p-6 text-left">
                                <SheetTitle className="text-xl font-bold">{selectedZone.name}</SheetTitle>
                                <SheetDescription>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getHazardStyle(selectedZone.hazard_level).bg} ${getHazardStyle(selectedZone.hazard_level).text}`}>
                                        {selectedZone.hazard_level} veszély
                                    </span>
                                </SheetDescription>
                            </SheetHeader>
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">Leírás</h3>
                                    <p className="text-sm text-muted-foreground">{selectedZone.description || 'Nincs megadva leírás.'}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3">Identified hazards</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {parsedHazards.length > 0 ? parsedHazards.map((hazard, i) => (
                                            <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                                                {hazard}
                                            </span>
                                        )) : <span className="text-sm text-muted-foreground">No hazards identified.</span>}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">Zone ID: {selectedZone.id}</p>

                                    <div className="flex items-center gap-2">
                                        {reportState.success && (
                                            <span className="text-xs text-green-500 font-medium">Reported successfully!</span>
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setReportState(prev => ({ ...prev, isOpen: true, error: null }));
                                            }}
                                        >
                                            Report Issue
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </SheetContent>
            </Sheet>

            {drawState.showConfirm && !drawState.showZoneForm && drawState.pendingFeature && (
                <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 w-full max-w-lg px-4">
                    <div className="bg-card text-card-foreground border border-border rounded-full shadow-lg p-4 flex items-center justify-between gap-4">
                        <div className="font-medium">Zone area acceptance?</div>
                        <div className="flex gap-2">
                            <Button onClick={resetDraw} variant="outline" className="rounded-full">Decline</Button>
                            <Button onClick={() => dispatch({ type: 'SET_SHOW_FORM', payload: true })} className="rounded-full">
                                Continue to Data Entry
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Sheet open={drawState.showZoneForm} onOpenChange={(open) => { if (!open) resetDraw(); }}>
                <SheetContent side="right" className="sm:max-w-md p-0">
                    <SheetHeader className="p-6 pb-0">
                        <SheetTitle>Report New Hazard Zone</SheetTitle>
                        <SheetDescription>Enter the details of the selected area.</SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 p-6">
                        <div className="grid gap-2">
                            <Label htmlFor="zone-name">Zone Name</Label>
                            <Input
                                id="zone-name"
                                placeholder="e.g., Northern Industrial District"
                                value={drawState.newZoneData.name}
                                onChange={e => dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: e.target.value } })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Hazard Level</Label>
                            <Select
                                value={drawState.newZoneData.hazard_level}
                                onValueChange={(value) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { hazard_level: value } })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select hazard level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zone-desc">Description</Label>
                            <Textarea
                                id="zone-desc"
                                placeholder="Description of the zone..."
                                value={drawState.newZoneData.description}
                                onChange={e => dispatch({ type: 'UPDATE_FORM_DATA', payload: { description: e.target.value } })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zone-hazards">Hazards (comma-separated)</Label>
                            <Input
                                id="zone-hazards"
                                placeholder="Fire, Oil, Toxic Gas..."
                                value={drawState.newZoneData.hazards}
                                onChange={e => dispatch({ type: 'UPDATE_FORM_DATA', payload: { hazards: e.target.value } })}
                            />
                        </div>
                    </div>
                    <SheetFooter className="p-6 pt-0">
                        <SheetClose asChild>
                            <Button type="button" variant="outline">Mégse</Button>
                        </SheetClose>
                        <Button
                            type="button"
                            onClick={submitNewZone}
                            disabled={!drawState.newZoneData.name}
                            className="cursor-pointer font-bold"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Mentés
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Sheet open={reportState.isOpen} onOpenChange={(open) => {
                if (!open) {
                    setReportState(prev => ({ ...prev, isOpen: false, error: null }));
                    setReportReason('');
                }
            }}>
                <SheetContent side="right" className="sm:max-w-md px-4">
                    <SheetHeader className='pl-0'>
                        <SheetTitle>Report Zone</SheetTitle>
                        <SheetDescription>
                            Please explain why you find the following zone problematic: <br />
                            <span className="font-semibold text-foreground">{selectedZone?.name}</span>
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="report-reason">Reason</Label>
                            <Textarea
                                id="report-reason"
                                placeholder="E.g.: Incorrect data provided, or the zone is no longer hazardous..."
                                value={reportReason}
                                onChange={e => setReportReason(e.target.value)}
                                rows={5}
                            />
                        </div>

                        {reportState.error && (
                            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{reportState.error}</p>
                        )}
                    </div>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setReportState(prev => ({ ...prev, isOpen: false }));
                                setReportReason('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleReportSubmit}
                            disabled={!reportReason.trim() || reportState.isLoading}
                        >
                            {reportState.isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                            ) : null}
                            Send Report
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}