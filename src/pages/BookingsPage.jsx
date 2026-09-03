import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BookingsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "staff";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await client.get("/bookings");
      setBookings(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id) {
    if (!confirm("Cancel this booking?")) return;
    await client.post(`/bookings/${id}/cancel`);
    load();
  }

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div>
      <h2>{isStaff ? "All Bookings" : "My Bookings"}</h2>
      <table className="data-table">
        <thead>
          <tr>
            {isStaff && <th>Customer</th>}
            <th>Route</th>
            <th>Departure</th>
            <th>Seats</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              {isStaff && <td>{b.user?.name}</td>}
              <td>
                {b.trip?.route?.origin} → {b.trip?.route?.destination}
              </td>
              <td>{b.trip?.departure_time && new Date(b.trip.departure_time).toLocaleString()}</td>
              <td>{b.seats_booked}</td>
              <td>${b.total_price.toFixed(2)}</td>
              <td>{b.status}</td>
              <td>{b.status === "confirmed" && <button onClick={() => handleCancel(b.id)}>Cancel</button>}</td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={isStaff ? 7 : 6}>No bookings yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
