"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

async function api(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export default function Home() {
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState("");
  const [me, setMe] = useState(null);

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@12345");
  const [name, setName] = useState("Admin");

  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [docs, setDocs] = useState([]);

  const [newProjectName, setNewProjectName] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  async function refreshProjects(tk = token) {
    const list = await api("/projects", { token: tk });
    setProjects(list);
    if (!activeProjectId && list?.[0]?.id) setActiveProjectId(list[0].id);
  }

  async function refreshDocs(pid = activeProjectId, tk = token) {
    if (!pid) return setDocs([]);
    const list = await api(`/docs?projectId=${pid}`, { token: tk });
    setDocs(list);
  }

  useEffect(() => {
    if (token) {
      refreshProjects().catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    if (token && activeProjectId) refreshDocs(activeProjectId).catch(() => {});
  }, [activeProjectId]);

  async function handleRegister() {
    const out = await api("/auth/register", { method: "POST", body: { email, password, name } });
    alert(`Registered: ${out.email}. Now login.`);
    setMode("login");
  }

  async function handleLogin() {
    const out = await api("/auth/login", { method: "POST", body: { email, password } });
    setToken(out.token);
    setMe(out.user);
  }

  async function createProject() {
    if (!newProjectName.trim()) return;
    await api("/projects", { token, method: "POST", body: { name: newProjectName } });
    setNewProjectName("");
    await refreshProjects();
  }

  async function createDoc() {
    if (!activeProjectId) return alert("Select a project first");
    if (!newDocTitle.trim()) return;
    await api(`/docs?projectId=${activeProjectId}`,
      {
        token,
        method: "POST",
        body: { title: newDocTitle, content: newDocContent }
      }
    );
    setNewDocTitle("");
    setNewDocContent("");
    await refreshDocs();
  }

  async function deleteDoc(id) {
    await api(`/docs/${id}`, { token, method: "DELETE" });
    await refreshDocs();
  }

  async function deleteProject(id) {
    await api(`/projects/${id}`, { token, method: "DELETE" });
    setActiveProjectId("");
    await refreshProjects();
    await refreshDocs("");
  }

  if (!token) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Developer CRM (Self-Hosted)</h1>
        <p style={{ opacity: 0.8 }}>
          Store projects, docs, git links, server notes, tools - all on your own VPS.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button onClick={() => setMode("login")}>Login</button>
          <button onClick={() => setMode("register")}>Register</button>
        </div>

        <div style={{ marginTop: 18, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          {mode === "register" && (
            <>
              <h3>Create Admin User</h3>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
              <br />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <br />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 8)"
                type="password"
              />
              <br />
              <button onClick={handleRegister}>Register</button>
            </>
          )}

          {mode === "login" && (
            <>
              <h3>Login</h3>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <br />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
              />
              <br />
              <button onClick={handleLogin}>Login</button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1100, margin: "30px auto", fontFamily: "system-ui", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Developer CRM</h1>
        <div>
          <span style={{ marginRight: 10, opacity: 0.8 }}>{me?.email}</span>
          <button onClick={() => (setToken(""), setMe(null))}>Logout</button>
        </div>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18, marginTop: 18 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <h3>Projects</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project name"
              style={{ flex: 1 }}
            />
            <button onClick={createProject}>Add</button>
          </div>

          <ul style={{ marginTop: 12 }}>
            {projects.map((p) => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => setActiveProjectId(p.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 10,
                    borderRadius: 10,
                    border: p.id === activeProjectId ? "2px solid #333" : "1px solid #ddd"
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ opacity: 0.7, fontSize: 13 }}>{p.description || "No description"}</div>
                </button>
                <button onClick={() => deleteProject(p.id)} style={{ marginTop: 6 }}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <h3>Docs {activeProject ? `- ${activeProject.name}` : ""}</h3>

          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <input
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Doc title (e.g. Server Setup, Git Link, API Notes)"
            />
            <textarea
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              placeholder="Write markdown here..."
              rows={6}
            />
            <button onClick={createDoc}>Save Doc</button>
          </div>

          <hr style={{ margin: "16px 0" }} />

          <ul>
            {docs.map((d) => (
              <li key={d.id} style={{ marginBottom: 14, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{d.title}</strong>
                  <button onClick={() => deleteDoc(d.id)}>Delete</button>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", opacity: 0.85, marginTop: 8 }}>{d.content}</pre>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
