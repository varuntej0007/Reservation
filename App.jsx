import React, { useState, useEffect } from "react";
import "./App.css";
import { FiMoon, FiSun } from "react-icons/fi";

const TOTAL_SEATS = 50; // Fixed total seats in the restaurant

const App = () => {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", guests: "" });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [occupiedSeats, setOccupiedSeats] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0); // Track total guests served
  const availableSeats = TOTAL_SEATS - occupiedSeats; // Dynamic available seats

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddReservation = (e) => {
    e.preventDefault();
    const guestsCount = parseInt(form.guests, 10);

    if (!form.name || !form.phone || !form.guests) return alert("Fill all fields");
    if (guestsCount > availableSeats) return alert("Not enough available seats!");

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const formattedDay = now.toLocaleDateString("en-US", { weekday: "long" });

    setReservations([...reservations, { 
      id: Date.now(), 
      ...form, 
      guests: guestsCount, 
      checkIn: now.toLocaleTimeString(), 
      checkOut: null,
      date: formattedDate, 
      day: formattedDay
    }]);

    setOccupiedSeats(prev => prev + guestsCount);
    setTotalGuests(prev => prev + guestsCount);
    setForm({ name: "", phone: "", guests: "" });
  };

  const handleCheckout = (id) => {
    const updatedReservations = reservations.map(res => {
      if (res.id === id && !res.checkOut) {
        setOccupiedSeats(prev => prev - res.guests); // Free up seats
        return { ...res, checkOut: new Date().toLocaleTimeString() };
      }
      return res;
    });
    setReservations(updatedReservations);
  };

  const handleDelete = (id) => {
    const deletedGuest = reservations.find(res => res.id === id);
    if (deletedGuest && !deletedGuest.checkOut) {
      setOccupiedSeats(prev => prev - deletedGuest.guests);
      setTotalGuests(prev => prev - deletedGuest.guests); // Reduce total guests if deleted before checkout
    }
    setReservations(reservations.filter(res => res.id !== id));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🍽️ The Grand Dine</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </header>

      {/* Dashboard for Guests Count, Occupied Seats, and Available Seats */}
      <div className="dashboard">
        <div className="left-box">
          <div className="info-box guests">
            <span>Total Guests</span>
            <h2>{totalGuests}</h2>
          </div>
          <div className="info-box occupied">
            <span>Occupied Seats</span>
            <h2>{occupiedSeats}</h2>
          </div>
        </div>
        <div className="info-box available fixed-box">
          <span>Available Seats</span>
          <h2>{availableSeats}</h2> {/* Dynamic calculation */}
        </div>
      </div>

      {/* Reservation Form */}
      <form onSubmit={handleAddReservation} className="reservation-form">
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
        <input type="number" name="guests" value={form.guests} onChange={handleChange} placeholder="Guests" min="1" required />
        <button type="submit">Reserve</button>
      </form>

      {/* Reservations List */}
      <section className="reservation-list">
        {reservations.length ? reservations.map(res => (
          <div key={res.id} className="reservation-card">
            <h3>{res.name}</h3>
            <p>📞 {res.phone}</p>
            <p>🧍 {res.guests} Guests</p>
            <p>📅 {res.day}, {res.date}</p> {/* Date & Day Added */}
            <p>⏳ Check-In: {res.checkIn}</p>
            <p>✅ Check-Out: {res.checkOut || "Pending"}</p>
            {!res.checkOut ? (
              <button onClick={() => handleCheckout(res.id)}>Checkout</button>
            ) : (
              <button onClick={() => handleDelete(res.id)}>Delete</button>
            )}
          </div>
        )) : <p>No Reservations</p>}
      </section>
    </div>
  );
};

export default App;
