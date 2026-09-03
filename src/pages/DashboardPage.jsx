import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [filters, setFilters] = useState({ origin: "", destination: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [seatInputs, setSeatInputs] = useState({});

  async function loadTrips(params = {}) {
    setLoading(true);
    try {
      const res = await client.get("/trips", { params: { status: "scheduled", ...params } });
      setTrips(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
  }, []);

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadTrips(filters);
  }

  async function handleBook(tripId, maxSeats) {
    setMessage("");
    const seats = Number(seatInputs[tripId] || 1);
    if (seats < 1 || seats > maxSeats) {
      setMessage("Enter a valid number of seats.");
      return;
    }
    try {
      await client.post("/bookings", { trip_id: tripId, seats_booked: seats });
      setMessage("Booking confirmed!");
      loadTrips(filters);
    } catch (err) {
      setMessage(err.response?.data?.error || "Booking failed");
    }
  }

  return (
    <div>
      <h2>Available Trips</h2>
      <form className="filter-form" onSubmit={handleFilterSubmit}>
        <input
          placeholder="Origin"
          value={filters.origin}
          onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
        />
        <input
          placeholder="Destination"
          value={filters.destination}
          onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
        />
        <button type="submit">Search</button>
      </form>

      {message && <p className="status-message">{message}</p>}
      {loading ? (
        <p>Loading trips...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Price</th>
              <th>Seats left</th>
              {user && <th>Book</th>}
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>
                  {trip.route?.origin} → {trip.route?.destination}
                </td>
                <td>{new Date(trip.departure_time).toLocaleString()}</td>
                <td>{new Date(trip.arrival_time).toLocaleString()}</td>
                <td>${trip.price.toFixed(2)}</td>
                <td>{trip.available_seats}</td>
                {user && (
                  <td className="book-cell">
                    <input
                      type="number"
                      min="1"
                      max={trip.available_seats}
                      value={seatInputs[trip.id] ?? 1}
                      onChange={(e) => setSeatInputs({ ...seatInputs, [trip.id]: e.target.value })}
                    />
                    <button
                      onClick={() => handleBook(trip.id, trip.available_seats)}
                      disabled={trip.available_seats < 1}
                    >
                      Book
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {trips.length === 0 && (
              <tr>
                <td colSpan={user ? 6 : 5}>No trips found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
