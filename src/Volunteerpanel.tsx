import { useState } from "react";
import "./VolunteerPanel.css";

export interface Task {
    id: number;
    title: string;
    type: string;
    priority: string;
    assignTo: string;
    locationName: string;
    latitude: string;
    longitude: string;
    description: string;
    status: "pending" | "assigned" | "completed";
}

interface VolunteerPanelProps {
    tasks: Task[];
    onUpdateStatus: (id: number, status: "pending" | "assigned" | "completed") => void;
}

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
    "High Priority": { bg: "#fee2e2", color: "#dc2626" },
    "Critical": { bg: "#fce7f3", color: "#9d174d" },
    "Medium Priority": { bg: "#fef3c7", color: "#d97706" },
    "Low Priority": { bg: "#dcfce7", color: "#16a34a" },
};

const STATUS_NEXT: Record<string, "pending" | "assigned" | "completed"> = {
    pending: "assigned",
    assigned: "completed",
    completed: "completed",
};

const STATUS_LABEL: Record<string, string> = {
    pending: "Accept Task",
    assigned: "Mark Complete",
    completed: "Completed ✓",
};

type FilterStatus = "all" | "pending" | "assigned" | "completed";

export default function VolunteerPanel({ tasks, onUpdateStatus }: VolunteerPanelProps) {
    const [filter, setFilter] = useState<FilterStatus>("all");
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const myTasks = tasks.filter((t) => {
        const matchFilter = filter === "all" || t.status === filter;
        const matchSearch =
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.locationName.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const counts = {
        all: tasks.length,
        pending: tasks.filter((t) => t.status === "pending").length,
        assigned: tasks.filter((t) => t.status === "assigned").length,
        completed: tasks.filter((t) => t.status === "completed").length,
    };

    return (
        <div className="vp-wrapper">
            {/* Volunteer Header */}
            <div className="vp-hero">
                <div className="vp-hero-left">
                    <div className="vp-avatar">👤</div>
                    <div>
                        <div className="vp-name">Volunteer Panel</div>
                        <div className="vp-subtitle">Your assigned tasks & missions</div>
                    </div>
                </div>
                <div className="vp-hero-stats">
                    <div className="vp-stat">
                        <span className="vp-stat-num">{counts.pending}</span>
                        <span className="vp-stat-label">Pending</span>
                    </div>
                    <div className="vp-stat-div" />
                    <div className="vp-stat">
                        <span className="vp-stat-num blue">{counts.assigned}</span>
                        <span className="vp-stat-label">In Progress</span>
                    </div>
                    <div className="vp-stat-div" />
                    <div className="vp-stat">
                        <span className="vp-stat-num green">{counts.completed}</span>
                        <span className="vp-stat-label">Completed</span>
                    </div>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="vp-toolbar">
                <div className="vp-search-wrap">
                    <span className="vp-search-icon">🔍</span>
                    <input
                        className="vp-search"
                        placeholder="Search tasks or locations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="vp-filters">
                    {(["all", "pending", "assigned", "completed"] as FilterStatus[]).map((f) => (
                        <button
                            key={f}
                            className={`vp-filter-btn ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="vp-filter-count">{counts[f]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Task Cards */}
            <div className="vp-tasks">
                {myTasks.length === 0 && (
                    <div className="vp-empty">
                        <span>📭</span>
                        <p>No tasks found</p>
                    </div>
                )}

                {myTasks.map((task) => {
                    const pc = PRIORITY_COLORS[task.priority] || { bg: "#f3f4f6", color: "#374151" };
                    const isExpanded = expandedId === task.id;
                    const isCompleted = task.status === "completed";

                    return (
                        <div
                            key={task.id}
                            className={`vp-task-card ${isCompleted ? "completed" : ""} ${isExpanded ? "expanded" : ""}`}
                        >
                            {/* Priority stripe */}
                            <div className="vp-stripe" style={{ background: pc.color }} />

                            <div className="vp-card-main">
                                <div className="vp-card-top">
                                    <div className="vp-card-title-row">
                                        <span className="vp-card-title">{task.title}</span>
                                        <span
                                            className="vp-priority-badge"
                                            style={{ background: pc.bg, color: pc.color }}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>

                                    <div className="vp-card-meta">
                                        <span className="vp-meta-item">
                                            <span>📍</span> {task.locationName}
                                        </span>
                                        <span className="vp-meta-dot">•</span>
                                        <span className="vp-meta-item">
                                            <span>🏷</span> {task.type}
                                        </span>
                                        <span className="vp-meta-dot">•</span>
                                        <span className="vp-meta-item">
                                            <span>👤</span> {task.assignTo}
                                        </span>
                                    </div>
                                </div>

                                {/* Expandable description */}
                                {task.description && (
                                    <button
                                        className="vp-expand-btn"
                                        onClick={() => setExpandedId(isExpanded ? null : task.id)}
                                    >
                                        {isExpanded ? "▲ Hide details" : "▼ View details"}
                                    </button>
                                )}

                                {isExpanded && task.description && (
                                    <div className="vp-description">{task.description}</div>
                                )}

                                {/* Coords + Action */}
                                <div className="vp-card-footer">
                                    <div className="vp-coords">
                                        <span className="vp-coord-label">LAT</span>
                                        <span className="vp-coord-val">{task.latitude}</span>
                                        <span className="vp-coord-label">LNG</span>
                                        <span className="vp-coord-val">{task.longitude}</span>
                                    </div>

                                    <div className="vp-card-actions">
                                        <span className={`vp-status-badge status-${task.status}`}>
                                            {task.status}
                                        </span>
                                        <button
                                            className={`vp-action-btn ${isCompleted ? "done" : ""}`}
                                            disabled={isCompleted}
                                            onClick={() => onUpdateStatus(task.id, STATUS_NEXT[task.status])}
                                        >
                                            {STATUS_LABEL[task.status]}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}