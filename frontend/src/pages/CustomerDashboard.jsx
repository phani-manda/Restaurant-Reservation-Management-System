import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationApi } from '../services/api';
import { formatDate } from '../utils/formatDate';

export default function CustomerDashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchReservations = async () => {
    try {
      setError('');
      const response = await reservationApi.getMy();
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

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    setCancellingId(id);
    setMessage('');
    try {
      await reservationApi.cancel(id);
      setMessage('Reservation cancelled successfully.');
      await fetchReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="loading">Loading reservations...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Reservations</h1>
        <Link to="/book" className="btn btn-primary">Book a Table</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {reservations.length === 0 ? (
        <div className="empty-state">
          <p>You have no reservations yet.</p>
          <Link to="/book" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Make your first reservation
          </Link>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Table</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id}>
                <td>{formatDate(res.date)}</td>
                <td>{res.timeSlot}</td>
                <td>Table {res.table.tableNumber} (seats {res.table.capacity})</td>
                <td>{res.guestCount}</td>
                <td>
                  <span className={`status-badge status-${res.status}`}>
                    {res.status}
                  </span>
                </td>
                <td>
                  {res.status === 'active' && (
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleCancel(res.id)}
                      disabled={cancellingId === res.id}
                    >
                      {cancellingId === res.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
