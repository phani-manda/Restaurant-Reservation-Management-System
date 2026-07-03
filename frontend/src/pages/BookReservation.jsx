import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationApi, TIME_SLOTS } from '../services/api';
import { getTodayDateInput } from '../utils/formatDate';

export default function BookReservation() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: getTodayDateInput(),
    timeSlot: TIME_SLOTS[1],
    guestCount: 2,
    tableId: '',
    notes: '',
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'guestCount' ? Number(value) : value,
      ...(name !== 'tableId' && name !== 'notes' ? { tableId: '' } : {}),
    }));
  };

  const checkAvailability = async () => {
    setError('');
    setLoadingTables(true);
    setAvailableTables([]);
    setForm((prev) => ({ ...prev, tableId: '' }));

    try {
      const response = await reservationApi.getAvailability(
        form.date,
        form.timeSlot,
        form.guestCount
      );
      setAvailableTables(response.data.tables);
      if (response.data.tables.length === 0) {
        setError('No tables available for the selected date, time, and guest count.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tableId) {
      setError('Please select a table.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await reservationApi.create({
        tableId: form.tableId,
        date: form.date,
        timeSlot: form.timeSlot,
        guestCount: form.guestCount,
        notes: form.notes || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Book a Table</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ maxWidth: '520px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              min={getTodayDateInput()}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeSlot">Time Slot</label>
            <select id="timeSlot" name="timeSlot" value={form.timeSlot} onChange={handleChange}>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="guestCount">Number of Guests</label>
            <input
              id="guestCount"
              name="guestCount"
              type="number"
              min={1}
              max={20}
              value={form.guestCount}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={checkAvailability}
            disabled={loadingTables}
            style={{ marginBottom: '1rem' }}
          >
            {loadingTables ? 'Checking...' : 'Check Availability'}
          </button>

          {availableTables.length > 0 && (
            <div className="form-group">
              <label htmlFor="tableId">Select Table</label>
              <select id="tableId" name="tableId" value={form.tableId} onChange={handleChange} required>
                <option value="">-- Choose a table --</option>
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table {table.tableNumber} (capacity: {table.capacity})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              maxLength={500}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting || !form.tableId}>
            {submitting ? 'Booking...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}
