import { useEffect, useState } from "react";
import client from "../../api/client";

const emptyForm = { origin: "", destination: "", distance_km: "", duration_min: "" };

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await client.get("/routes");
    setRoutes(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(route) {
    setEditingId(route.id);
    setForm({
      origin: route.origin,
      destination: route.destination,
      distance_km: route.distance_km,
      duration_min: route.duration_min,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      distance_km: Number(form.distance_km),
      duration_min: Number(form.duration_min),
    };
    try {
      if (editingId) {
        await client.put(`/routes/${editingId}`, payload);
      } else {
        await client.post("/routes", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save route");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this route?")) return;
    setError("");
    try {
      await client.delete(`/routes/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete route");
    }
  }

  return (
    <div>
      <h2>Routes</h2>
      <form className="entity-form" onSubmit={handleSubmit}>
        <input
          placeholder="Origin"
          value={form.origin}
          onChange={(e) => setForm({ ...form, origin: e.target.value })}
          required
        />
        <input
          placeholder="Destination"
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Distance (km)"
          min="0"
          step="0.1"
          value={form.distance_km}
          onChange={(e) => setForm({ ...form, distance_km: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Duration (min)"
          min="1"
          value={form.duration_min}
          onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
          required
        />
        <button type="submit">{editingId ? "Update" : "Add"} Route</button>
        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>
      {error && <p className="error-message">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Origin</th>
            <th>Destination</th>
            <th>Distance (km)</th>
            <th>Duration (min)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r) => (
            <tr key={r.id}>
              <td>{r.origin}</td>
              <td>{r.destination}</td>
              <td>{r.distance_km}</td>
              <td>{r.duration_min}</td>
              <td>
                <button onClick={() => startEdit(r)}>Edit</button>
                <button onClick={() => handleDelete(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {routes.length === 0 && (
            <tr>
              <td colSpan={5}>No routes yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
