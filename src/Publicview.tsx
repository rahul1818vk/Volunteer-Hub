import { useState } from "react";
import "./PublicView.css";

export interface Task {
    id: number;
    title: string;
    type: string;
    priority: string;
    locationName: string;
    latitude: string;
    longitude: string;
    description: string;
    status: "pending" | "assigned" | "completed";
}

interface PublicViewProps {
    tasks: Task[];
}

const TYPE_ICONS: Record<string, string> = {
    Delivery: "🚚",
    Distribution: "📦",
    Setup: "🏗",
    Rescue: "🚨",
    Medical: "🏥",
    Other: "📋",
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
    "High Priority": { bg: "#fff1f2", color: "#dc2626", border: "#fecaca" },
    "Critical": { bg: "#fdf2f8", color: "#9d174d", border: "#f9a8d4" },
    "Medium Priority": { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    "Low Priority": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

export default function PublicView({ tasks }: PublicViewProps) {
    const [search, setSearch] = useState("");

    const filtered = tasks.filter(
        (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.locationName.toLowerCase().includes(search.toLowerCase()) ||
            t.type.toLowerCase().includes(search.toLowerCase())
    );

    const pending = filtered.filter((t) => t.status === "pending");
    const assigned = filtered.filter((t) => t.status === "assigned");
    const completed = filtered.filter((t) => t.status === "completed");

    const total = tasks.length;
    const pct = total > 0 ? Math.round((tasks.filter(t => t.status === "completed").length / total) * 100) : 0;

    return (
        <div className="pub-wrapper">
            {/* Public Banner */}
            <div className="pub-banner">
                <div className="pub-banner-left">
                    <div className="pub-globe">🌐</div>
                    <div>
                        <div className="pub-banner-title">Live Operations Board</div>
                        <div className="pub-banner-sub">Real-time volunteer coordination status</div>
                    </div>
                </div>
                <div className="pub-progress-wrap">
                    <div className="pub-progress-label">
                        <span>Mission Progress</span>
                        <span className="pub-pct">{pct}%</span>
                    </div>
                    <div className="pub-progress-track">
                        <div className="pub-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="pub-progress-sub">{tasks.filter(t => t.status === "completed").length} of {total} tasks completed</div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="pub-summary">
                <div className="pub-sum-card">
                    <div className="pub-sum-icon" style={{ background: "#fff7ed" }}>⏳</div>
                    <div>
                        <div className="pub-sum-num" style={{ color: "#f59e0b" }}>{tasks.filter(t => t.status === "pending").length}</div>
                        <div className="pub-sum-label">Awaiting Volunteers</div>
                    </div>
                </div>
                <div className="pub-sum-card">
                    <div className="pub-sum-icon" style={{ background: "#eff6ff" }}>🚀</div>
                    <div>
                        <div className="pub-sum-num" style={{ color: "#2563eb" }}>{tasks.filter(t => t.status === "assigned").length}</div>
                        <div className="pub-sum-label">In Progress</div>
                    </div>
                </div>
                <div className="pub-sum-card">
                    <div className="pub-sum-icon" style={{ background: "#f0fdf4" }}>✅</div>
                    <div>
                        <div className="pub-sum-num" style={{ color: "#10b981" }}>{tasks.filter(t => t.status === "completed").length}</div>
                        <div className="pub-sum-label">Completed</div>
                    </div>
                </div>
                <div className="pub-sum-card">
                    <div className="pub-sum-icon" style={{ background: "#fef2f2" }}>🔴</div>
                    <div>
                        <div className="pub-sum-num" style={{ color: "#ef4444" }}>{tasks.filter(t => t.priority === "High Priority" || t.priority === "Critical").length}</div>
                        <div className="pub-sum-label">High Priority</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="pub-search-wrap">
                <span className="pub-search-icon">🔍</span>
                <input
                    className="pub-search"
                    placeholder="Search tasks, locations or types..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Kanban Columns */}
            <div className="pub-kanban">
                {/* Pending */}
                <div className="pub-column">
                    <div className="pub-col-header pending">
                        <span className="pub-col-dot" style={{ background: "#f59e0b" }} />
                        <span className="pub-col-title">Awaiting Volunteers</span>
                        <span className="pub-col-count">{pending.length}</span>
                    </div>
                    <div className="pub-col-cards">
                        {pending.length === 0 && <div className="pub-col-empty">No pending tasks</div>}
                        {pending.map((task) => <PublicCard key={task.id} task={task} />)}
                    </div>
                </div>

                {/* Assigned */}
                <div className="pub-column">
                    <div className="pub-col-header assigned">
                        <span className="pub-col-dot" style={{ background: "#2563eb" }} />
                        <span className="pub-col-title">In Progress</span>
                        <span className="pub-col-count">{assigned.length}</span>
                    </div>
                    <div className="pub-col-cards">
                        {assigned.length === 0 && <div className="pub-col-empty">No active tasks</div>}
                        {assigned.map((task) => <PublicCard key={task.id} task={task} />)}
                    </div>
                </div>

                {/* Completed */}
                <div className="pub-column">
                    <div className="pub-col-header completed">
                        <span className="pub-col-dot" style={{ background: "#10b981" }} />
                        <span className="pub-col-title">Completed</span>
                        <span className="pub-col-count">{completed.length}</span>
                    </div>
                    <div className="pub-col-cards">
                        {completed.length === 0 && <div className="pub-col-empty">No completed tasks yet</div>}
                        {completed.map((task) => <PublicCard key={task.id} task={task} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PublicCard({ task }: { task: Task }) {
    const pc = PRIORITY_COLORS[task.priority] || { bg: "#f9fafb", color: "#374151", border: "#e5e7eb" };
    const icon = TYPE_ICONS[task.type] || "📋";

    return (
        <div
            className="pub-card"
            style={{ borderColor: pc.border }}
        >
            <div className="pub-card-top">
                <div className="pub-card-icon-wrap" style={{ background: pc.bg }}>
                    <span>{icon}</span>
                </div>
                <div className="pub-card-info">
                    <div className="pub-card-title">{task.title}</div>
                    <div className="pub-card-type">{task.type}</div>
                </div>
                <span
                    className="pub-card-priority"
                    style={{ background: pc.bg, color: pc.color }}
                >
                    {task.priority.replace(" Priority", "")}
                </span>
            </div>

            <div className="pub-card-location">
                <span>📍</span>
                <span>{task.locationName}</span>
            </div>

            {task.description && (
                <div className="pub-card-desc">{task.description}</div>
            )}

            <div className="pub-card-footer">
                <span className={`pub-card-status status-${task.status}`}>
                    {task.status === "pending" && "⏳ Awaiting"}
                    {task.status === "assigned" && "🚀 In Progress"}
                    {task.status === "completed" && "✅ Done"}
                </span>
                <span className="pub-card-coords">
                    {task.latitude}, {task.longitude}
                </span>
            </div>
        </div>
    );
}