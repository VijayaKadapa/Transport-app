import { useEffect, useState } from "react";
import client from "../../api/client";

const emptyForm = {
  route_id: "",
  vehicle_id: "",
  driver_id: "",
  departure_time: "",
  arrival_time: "",
  price: "",
  available_seats: "",
  status: "scheduled",
};

function toLocalInput(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const [tripsRes, routesRes, vehiclesRes, driversRes] = await Promise.all([
      client.get("/trips"),
      client.get("/routes"),
      client.get("/vehicles"),
      client.get("/drivers"),
    ]);
    setTrips(tripsRes.data);
    setRoutes(routesRes.data);
    setVehicles(vehiclesRes.data);
    setDrivers(driversRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(trip) {
    setEditingId(trip.id);
    setForm({
      route_id: trip.route_id,
      vehicle_id: trip.vehicle_id,
      driver_id: trip.driver_id,
      departure_time: toLocalInput(trip.departure_time),
      arrival_time: toLocalInput(trip.arrival_time),
      price: trip.price,
      available_seats: trip.available_seats,
      status: trip.status,
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
      route_id: Number(form.route_id),
      vehicle_id: Number(form.vehicle_id),
      driver_id: Number(form.driver_id),
      departure_time: new Date(form.departure_time).toISOString(),
      arrival_time: new Date(form.arrival_time).toISOString(),
      price: Number(form.price),
      available_seats: Number(form.available_seats),
      status: form.status,
    };
    try {
      if (editingId) {
        await client.put(`/trips/${editingId}`, payload);
      } else {
        await client.post("/trips", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save trip");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this trip?")) return;
    setError("");
    try {
      await client.delete(`/trips/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete trip");
    }
  }

  return (
    <div>
      <h2>Trips</h2>
      <form className="entity-form" onSubmit={handleSubmit}>
        <select
          value={form.route_id}
          onChange={(e) => setForm({ ...form, route_id: e.target.value })}
          required
        >
          <option value="">Route...</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.origin} → {r.destination}
            </option>
          ))}
        </select>
        <select
          value={form.vehicle_id}
          onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
          required
        >
          <option value="">Vehicle...</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.plate_number} ({v.type})
            </option>
          ))}
        </select>
        <select
          value={form.driver_id}
          onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
          required
        >
          <option value="">Driver...</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={form.departure_time}
          onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          value={form.arrival_time}
          onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Available seats"
          min="0"
          value={form.available_seats}
          onChange={(e) => setForm({ ...form, available_seats: e.target.value })}
          required
        />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit">{editingId ? "Update" : "Add"} Trip</button>
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
            <th>Route</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Price</th>
            <th>Seats</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trips.map((t) => (
            <tr key={t.id}>
              <td>
                {t.route?.origin} → {t.route?.destination}
              </td>
              <td>{new Date(t.departure_time).toLocaleString()}</td>
              <td>{new Date(t.arrival_time).toLocaleString()}</td>
              <td>${t.price.toFixed(2)}</td>
              <td>{t.available_seats}</td>
              <td>{t.status}</td>
              <td>
                <button onClick={() => startEdit(t)}>Edit</button>
                <button onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {trips.length === 0 && (
            <tr>
              <td colSpan={7}>No trips yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
