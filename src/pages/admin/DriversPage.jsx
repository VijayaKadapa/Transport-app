import { useEffect, useState } from "react";
import client from "../../api/client";

const emptyForm = { name: "", license_number: "", phone: "", status: "available" };

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await client.get("/drivers");
    setDrivers(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(driver) {
    setEditingId(driver.id);
    setForm({
      name: driver.name,
      license_number: driver.license_number,
      phone: driver.phone,
      status: driver.status,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await client.put(`/drivers/${editingId}`, form);
      } else {
        await client.post("/drivers", form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save driver");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this driver?")) return;
    setError("");
    try {
      await client.delete(`/drivers/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete driver");
    }
  }

  return (
    <div>
      <h2>Drivers</h2>
      <form className="entity-form" onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="License number"
          value={form.license_number}
          onChange={(e) => setForm({ ...form, license_number: e.target.value })}
          required
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="available">Available</option>
          <option value="on_trip">On trip</option>
          <option value="off_duty">Off duty</option>
        </select>
        <button type="submit">{editingId ? "Update" : "Add"} Driver</button>
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
            <th>Name</th>
            <th>License</th>
            <th>Phone</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{d.license_number}</td>
              <td>{d.phone}</td>
              <td>{d.status}</td>
              <td>
                <button onClick={() => startEdit(d)}>Edit</button>
                <button onClick={() => handleDelete(d.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {drivers.length === 0 && (
            <tr>
              <td colSpan={5}>No drivers yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
