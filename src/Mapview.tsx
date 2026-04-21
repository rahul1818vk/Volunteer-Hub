import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./MapView.css";
// @ts-ignore
import 'leaflet-routing-machine';

// Fix default marker icons broken by webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export interface MapTask {
    id: number;
    title: string;
    priority: string;
    status: string;
    locationName: string;
    latitude: string;
    longitude: string;
    description?: string;
    type: string;
}

interface MapViewProps {
    tasks: MapTask[];
}

const PRIORITY_COLORS: Record<string, string> = {
    "High Priority": "#ef4444",
    "Critical": "#9d174d",
    "Medium Priority": "#f59e0b",
    "Low Priority": "#10b981",
};

const STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b",
    assigned: "#3b82f6",
    completed: "#10b981",
};

function createPinIcon(priority: string) {
    const color = PRIORITY_COLORS[priority] || "#2563eb";
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <defs>
        <filter id="shadow" x="-30%" y="-10%" width="160%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="M16 0C7.16 0 0 7.16 0 16c0 10 16 26 16 26S32 26 32 16C32 7.16 24.84 0 16 0z"
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
      <circle cx="16" cy="16" r="4" fill="${color}"/>
    </svg>`;
    return L.divIcon({
        html: svg,
        className: "custom-pin",
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -44],
    });
}

export default function MapView({ tasks }: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const routingControlRef = useRef<any>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const [showRouting, setShowRouting] = useState(true);
    const [selectedTask, setSelectedTask] = useState<MapTask | null>(null);

    const validTasks = tasks.filter(
        (t) => !isNaN(parseFloat(t.latitude)) && !isNaN(parseFloat(t.longitude))
    );

    // Init map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [40.7128, -74.006],
            zoom: 11,
            zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Add/update markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        if (validTasks.length === 0) return;

        const bounds: L.LatLngExpression[] = [];

        validTasks.forEach((task) => {
            const lat = parseFloat(task.latitude);
            const lng = parseFloat(task.longitude);
            const latlng: L.LatLngExpression = [lat, lng];
            bounds.push(latlng);

            const marker = L.marker(latlng, { icon: createPinIcon(task.priority) });

            const statusColor = STATUS_COLORS[task.status] || "#888";
            const priorityColor = PRIORITY_COLORS[task.priority] || "#2563eb";

            marker.bindPopup(`
        <div class="map-popup">
          <div class="popup-title">${task.title}</div>
          <div class="popup-meta">
            <span class="popup-badge" style="background:${priorityColor}20;color:${priorityColor}">${task.priority}</span>
            <span class="popup-badge" style="background:${statusColor}20;color:${statusColor}">${task.status}</span>
          </div>
          <div class="popup-row"><span class="popup-icon">📍</span>${task.locationName}</div>
          <div class="popup-row"><span class="popup-icon">🏷</span>${task.type}</div>
          ${task.description ? `<div class="popup-desc">${task.description}</div>` : ""}
        </div>
      `, { maxWidth: 260 });

            marker.on("click", () => setSelectedTask(task));
            marker.addTo(map);
            markersRef.current.push(marker);
        });

        if (bounds.length > 1) {
            map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [60, 60] });
        } else if (bounds.length === 1) {
            map.setView(bounds[0], 13);
        }
    }, [tasks]);

    // Routing
    useEffect(() => {
        const map = mapRef.current;
        if (!map || validTasks.length < 2) return;

        // Dynamically import leaflet-routing-machine
        // @ts-ignore
        import("leaflet-routing-machine").then(() => {

            if (routingControlRef.current) {
                routingControlRef.current.remove();
                routingControlRef.current = null;
            }

            if (!showRouting) return;

            const waypoints = validTasks.map((t) =>
                L.latLng(parseFloat(t.latitude), parseFloat(t.longitude))
            );

            const control = (L as any).Routing.control({
                waypoints,
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false,
                show: false, // hide the turn-by-turn panel
                lineOptions: {
                    styles: [
                        { color: "#2563eb", opacity: 0.15, weight: 8 },
                        { color: "#2563eb", opacity: 0.8, weight: 3, dashArray: "6 4" },
                    ],
                    extendToWaypoints: true,
                    missingRouteTolerance: 0,
                },
                createMarker: () => null, // use our own markers
            });

            control.addTo(map);
            routingControlRef.current = control;
        }).catch(() => {
            console.warn("leaflet-routing-machine not available");
        });

        return () => {
            if (routingControlRef.current) {
                routingControlRef.current.remove();
                routingControlRef.current = null;
            }
        };
    }, [tasks, showRouting]);

    return (
        <div className="map-wrapper">
            {/* Sidebar */}
            <div className="map-sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-title">Task Locations</span>
                    <span className="sidebar-count">{validTasks.length}</span>
                </div>

                <div className="sidebar-controls">
                    <button
                        className={`route-toggle ${showRouting ? "active" : ""}`}
                        onClick={() => setShowRouting((v) => !v)}
                    >
                        <span>{showRouting ? "🗺" : "🗺"}</span>
                        {showRouting ? "Hide Route" : "Show Route"}
                    </button>
                </div>

                <div className="sidebar-tasks">
                    {validTasks.map((task, i) => {
                        const color = PRIORITY_COLORS[task.priority] || "#2563eb";
                        const isSelected = selectedTask?.id === task.id;
                        return (
                            <div
                                key={task.id}
                                className={`sidebar-task ${isSelected ? "selected" : ""}`}
                                onClick={() => {
                                    setSelectedTask(task);
                                    const map = mapRef.current;
                                    if (map) {
                                        map.setView(
                                            [parseFloat(task.latitude), parseFloat(task.longitude)],
                                            14,
                                            { animate: true }
                                        );
                                        markersRef.current[i]?.openPopup();
                                    }
                                }}
                            >
                                <div className="sidebar-task-pin" style={{ background: color }}>
                                    {i + 1}
                                </div>
                                <div className="sidebar-task-info">
                                    <div className="sidebar-task-title">{task.title}</div>
                                    <div className="sidebar-task-loc">📍 {task.locationName}</div>
                                </div>
                                <div
                                    className="sidebar-task-status"
                                    style={{ color: STATUS_COLORS[task.status] || "#888" }}
                                >
                                    {task.status}
                                </div>
                            </div>
                        );
                    })}

                    {validTasks.length === 0 && (
                        <div className="sidebar-empty">
                            <span>📭</span>
                            <p>No tasks with valid coordinates</p>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="map-legend">
                    <div className="legend-title">Priority</div>
                    {Object.entries(PRIORITY_COLORS).map(([label, color]) => (
                        <div key={label} className="legend-item">
                            <span className="legend-dot" style={{ background: color }} />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map */}
            <div className="map-container" ref={mapContainerRef} />
        </div>
    );
}