import { useEffect, useState } from 'react';
import { tableApi } from '../services/api';

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTables = async () => {
    try {
      setError('');
      const response = await tableApi.getAll();
      setTables(response.data.tables);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await tableApi.create({
        tableNumber: Number(form.tableNumber),
        capacity: Number(form.capacity),
      });
      setMessage('Table created successfully.');
      setForm({ tableNumber: '', capacity: '' });
      setShowForm(false);
      fetchTables();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (table) => {
    try {
      await tableApi.update(table._id, { isActive: !table.isActive });
      setMessage(`Table ${table.tableNumber} ${table.isActive ? 'deactivated' : 'activated'}.`);
      fetchTables();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (table) => {
    if (!window.confirm(`Delete Table ${table.tableNumber}?`)) return;

    try {
      await tableApi.delete(table._id);
      setMessage(`Table ${table.tableNumber} deleted.`);
      fetchTables();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading tables...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Manage Tables</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Table'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {showForm && (
        <div className="card" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Add New Table</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="tableNumber">Table Number</label>
              <input
                id="tableNumber"
                name="tableNumber"
                type="number"
                min={1}
                value={form.tableNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Table'}
            </button>
          </form>
        </div>
      )}

      {tables.length === 0 ? (
        <div className="empty-state">No tables configured. Run the seed script or add tables manually.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Table #</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table._id}>
                <td>{table.tableNumber}</td>
                <td>{table.capacity} seats</td>
                <td>
                  <span className={`status-badge ${table.isActive ? 'status-active' : 'status-cancelled'}`}>
                    {table.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => toggleActive(table)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    {table.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(table)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
