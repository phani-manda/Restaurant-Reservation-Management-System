import { useEffect, useState } from 'react';
import { reservationApi, TIME_SLOTS } from '../services/api';
import { formatDate, toDateInputValue } from '../utils/formatDate';

export default function AdminDashboard() {
  const [reservations, setReservations] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingReservation, setEditingReservation] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchReservations = async (date) => {
    try {
      setError('');
      setLoading(true);
      const response = await reservationApi.getAll(date || undefined);
      setReservations(response.data.reservations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReservations(filterDate);
  };

  const handleClearFilter = () => {
    setFilterDate('');
    fetchReservations();
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;

    try {
      await reservationApi.cancel(id);
      setMessage('Reservation cancelled.');
      fetchReservations(filterDate || undefined);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (reservation) => {
    setEditingReservation(reservation);
    setEditForm({
      date: toDateInputValue(reservation.date),
      timeSlot: reservation.timeSlot,
      guestCount: reservation.guestCount,
      status: reservation.status,
      notes: reservation.notes || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'guestCount' ? Number(value) : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await reservationApi.update(editingReservation.id, editForm);
      setMessage('Reservation updated successfully.');
      setEditingReservation(null);
      fetchReservations(filterDate || undefined);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Admin - All Reservations</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form className="filter-bar" onSubmit={handleFilter}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="filterDate">Filter by Date</label>
          <input
            id="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Filter</button>
        <button type="button" className="btn btn-secondary" onClick={handleClearFilter}>
          Clear
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">No reservations found.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Table</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id}>
                <td>{res.user.name}<br /><small>{res.user.email}</small></td>
                <td>{formatDate(res.date)}</td>
                <td>{res.timeSlot}</td>
                <td>Table {res.table.tableNumber}</td>
                <td>{res.guestCount}</td>
                <td>
                  <span className={`status-badge status-${res.status}`}>
                    {res.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => openEditModal(res)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Edit
                  </button>
                  {res.status === 'active' && (
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleCancel(res.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingReservation && (
        <div className="modal-overlay" onClick={() => setEditingReservation(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Reservation</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-date">Date</label>
                <input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-timeSlot">Time Slot</label>
                <select
                  id="edit-timeSlot"
                  name="timeSlot"
                  value={editForm.timeSlot}
                  onChange={handleEditChange}
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-guestCount">Guests</label>
                <input
                  id="edit-guestCount"
                  name="guestCount"
                  type="number"
                  min={1}
                  value={editForm.guestCount}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                >
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-notes">Notes</label>
                <textarea
                  id="edit-notes"
                  name="notes"
                  rows={2}
                  value={editForm.notes}
                  onChange={handleEditChange}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingReservation(null)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
