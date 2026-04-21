import { useState } from "react";
import "./App.css";
import MapView from "./Mapview";
import VolunteerPanel from "./Volunteerpanel";
import PublicView from "./Publicview";
import 'leaflet/dist/leaflet.css';

type Tab = "dispatch" | "tasks" | "map" | "verification";
type ViewMode = "admin" | "volunteer" | "public";

interface Task {
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

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Medical Supplies Delivery",
    type: "Delivery",
    priority: "High Priority",
    assignTo: "Volunteer A",
    locationName: "Central Park, NYC",
    latitude: "40.7812",
    longitude: "-73.9665",
    description: "Deliver medical supplies urgently.",
    status: "pending",
  },
  {
    id: 2,
    title: "Food Distribution",
    type: "Distribution",
    priority: "Medium Priority",
    assignTo: "Volunteer B",
    locationName: "Brooklyn, NYC",
    latitude: "40.6782",
    longitude: "-73.9442",
    description: "Distribute food packages.",
    status: "assigned",
  },
  {
    id: 3,
    title: "Shelter Setup",
    type: "Setup",
    priority: "Low Priority",
    assignTo: "Volunteer C",
    locationName: "Queens, NYC",
    latitude: "40.7282",
    longitude: "-73.7949",
    description: "Set up temporary shelter.",
    status: "completed",
  },
];

// ── Shared Header ──────────────────────────────────────────
function AppHeader({
  viewMode, setViewMode, totalActive, pending, assigned, completed, highPriority,
}: {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  totalActive: number; pending: number; assigned: number; completed: number; highPriority: number;
}) {
  return (
    <>
      <div className="view-toggle-bar">
        <span className="view-as-label">VIEW AS</span>
        <button className={`view-btn ${viewMode === "admin" ? "active" : ""}`} onClick={() => setViewMode("admin")}>
          <span className="view-icon">⊙</span> Admin Panel
        </button>
        <button className={`view-btn ${viewMode === "volunteer" ? "active" : ""}`} onClick={() => setViewMode("volunteer")}>
          <span className="view-icon">👤</span> Volunteer Panel
        </button>
        <button className={`view-btn ${viewMode === "public" ? "active" : ""}`} onClick={() => setViewMode("public")}>
          <span className="view-icon">🌐</span> Public View
        </button>
      </div>
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" />
              <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.5" />
              <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.5" />
              <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div>
            <div className="brand-title">DISPATCH COMMAND</div>
            <div className="brand-subtitle">SMART VOLUNTEER COORDINATION</div>
          </div>
        </div>
        <div className="stats-bar">
          <div className="stat-item"><div className="stat-label">TOTAL ACTIVE</div><div className="stat-value">{totalActive}</div></div>
          <div className="stat-divider" />
          <div className="stat-item"><div className="stat-label"><span className="dot dot-orange" />PENDING</div><div className="stat-value">{pending}</div></div>
          <div className="stat-divider" />
          <div className="stat-item"><div className="stat-label"><span className="dot dot-blue" />ASSIGNED</div><div className="stat-value">{assigned}</div></div>
          <div className="stat-divider" />
          <div className="stat-item"><div className="stat-label"><span className="dot dot-green" />COMPLETED</div><div className="stat-value">{completed}</div></div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-label"><span className="dot dot-red" />HIGH PRIORITY</div>
            <div className={`stat-value ${highPriority > 0 ? "text-red" : ""}`}>{highPriority}</div>
          </div>
        </div>
      </header>
    </>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dispatch");
  const [viewMode, setViewMode] = useState<ViewMode>("admin");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const [form, setForm] = useState({
    title: "",
    type: "Other",
    priority: "Medium Priority",
    assignTo: "Volunteer",
    locationName: "Central Park, NYC",
    latitude: "40.7812",
    longitude: "-73.9665",
    description: "",
  });

  const totalActive = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const assigned = tasks.filter((t) => t.status === "assigned").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const highPriority = tasks.filter((t) => t.priority === "High Priority").length;

  const headerProps = { viewMode, setViewMode, totalActive, pending, assigned, completed, highPriority };

  const handleDispatch = () => {
    if (!form.title.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: form.title,
      type: form.type,
      priority: form.priority,
      assignTo: form.assignTo,
      locationName: form.locationName,
      latitude: form.latitude,
      longitude: form.longitude,
      description: form.description,
      status: "pending",
    };
    setTasks([...tasks, newTask]);
    setForm({ ...form, title: "", description: "" });
    setActiveTab("tasks");
  };

  const handleUpdateStatus = (id: number, status: "pending" | "assigned" | "completed") => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  // ── Volunteer Panel ────────────────────────────────────────
  if (viewMode === "volunteer") {
    return (
      <div className="app">
        <AppHeader {...headerProps} />
        <main className="main-content">
          <VolunteerPanel tasks={tasks} onUpdateStatus={handleUpdateStatus} />
        </main>
      </div>
    );
  }

  // ── Public View ────────────────────────────────────────────
  if (viewMode === "public") {
    return (
      <div className="app">
        <AppHeader {...headerProps} />
        <main className="main-content pub-main">
          <PublicView tasks={tasks} />
        </main>
      </div>
    );
  }

  // ── Admin Panel ────────────────────────────────────────────
  return (
    <div className="app">
      <AppHeader {...headerProps} />

      <nav className="tabs">
        <button className={`tab-btn ${activeTab === "dispatch" ? "active" : ""}`} onClick={() => setActiveTab("dispatch")}>
          <span>✈</span> Dispatch Task
        </button>
        <button className={`tab-btn ${activeTab === "tasks" ? "active" : ""}`} onClick={() => setActiveTab("tasks")}>
          <span>☰</span> Tasks <span className="tab-badge">{tasks.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === "map" ? "active" : ""}`} onClick={() => setActiveTab("map")}>
          <span>📍</span> Map <span className="tab-badge">{tasks.length}</span>
        </button>
      </nav>

      <main className={`main-content ${activeTab === "map" ? "map-mode" : ""}`}>
        {activeTab === "dispatch" && (
          <div className="card dispatch-card">
            <div className="card-header-accent" />
            <h2 className="card-title">Dispatch New Task</h2>
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input className="form-input" placeholder="e.g. Medical Supplies Delivery" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">Task Type</label>
                <div className="select-wrapper">
                  <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option>Other</option><option>Delivery</option><option>Distribution</option>
                    <option>Setup</option><option>Rescue</option><option>Medical</option>
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>
              <div className="form-group flex-1">
                <label className="form-label">Priority</label>
                <div className="select-wrapper">
                  <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option>Low Priority</option><option>Medium Priority</option>
                    <option>High Priority</option><option>Critical</option>
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <div className="select-wrapper full-width">
                <select className="form-select" value={form.assignTo} onChange={(e) => setForm({ ...form, assignTo: e.target.value })}>
                  <option>Volunteer</option><option>Volunteer A</option><option>Volunteer B</option>
                  <option>Volunteer C</option><option>Team Lead</option>
                </select>
                <span className="select-arrow">▾</span>
              </div>
            </div>
            <div className="form-row location-row">
              <div className="form-group location-name">
                <label className="form-label">Location Name</label>
                <input className="form-input" value={form.locationName} onChange={(e) => setForm({ ...form, locationName: e.target.value })} />
              </div>
              <div className="form-group coord">
                <label className="form-label">Latitude</label>
                <input className="form-input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              </div>
              <div className="form-group coord">
                <label className="form-label">Longitude</label>
                <input className="form-input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Details about the required action..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button className="dispatch-btn" onClick={handleDispatch}>Dispatch Task</button>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="tasks-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <span className="task-title">{task.title}</span>
                  <span className={`task-priority priority-${task.priority.toLowerCase().replace(/ /g, "-")}`}>{task.priority}</span>
                </div>
                <div className="task-meta">
                  <span>{task.type}</span><span>•</span>
                  <span>{task.locationName}</span><span>•</span>
                  <span>Assigned to: {task.assignTo}</span>
                </div>
                <div className="task-footer">
                  <span className={`task-status status-${task.status}`}>{task.status}</span>
                  {task.description && <p className="task-desc">{task.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "map" && <MapView tasks={tasks} />}
      </main>
    </div>
  );
}