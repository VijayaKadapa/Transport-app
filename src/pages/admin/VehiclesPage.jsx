import { useEffect, useState } from "react";
import client from "../../api/client";

const emptyForm = { plate_number: "", type: "bus", capacity: "", status: "active" };

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await client.get("/vehicles");
    setVehicles(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(vehicle) {
    setEditingId(vehicle.id);
    setForm({
      plate_number: vehicle.plate_number,
      type: vehicle.type,
      capacity: vehicle.capacity,
      status: vehicle.status,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = { ...form, capacity: Number(form.capacity) };
    try {
      if (editingId) {
        await client.put(`/vehicles/${editingId}`, payload);
      } else {
        await client.post("/vehicles", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save vehicle");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this vehicle?")) return;
    await client.delete(`/vehicles/${id}`);
    load();
  }

  return (
    <div>
      <h2>Vehicles</h2>
      <form className="entity-form" onSubmit={handleSubmit}>
        <input
          placeholder="Plate number"
          value={form.plate_number}
          onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
          required
        />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="bus">Bus</option>
          <option value="van">Van</option>
          <option value="truck">Truck</option>
        </select>
        <input
          type="number"
          placeholder="Capacity"
          min="1"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          required
        />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit">{editingId ? "Update" : "Add"} Vehicle</button>
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
            <th>Plate</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id}>
              <td>{v.plate_number}</td>
              <td>{v.type}</td>
              <td>{v.capacity}</td>
              <td>{v.status}</td>
              <td>
                <button onClick={() => startEdit(v)}>Edit</button>
                <button onClick={() => handleDelete(v.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {vehicles.length === 0 && (
            <tr>
              <td colSpan={5}>No vehicles yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
