import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={isAdmin ? '/admin' : '/dashboard'}>Restaurant Reservations</Link>
      </div>
      {user && (
        <div className="navbar-links">
          {isAdmin ? (
            <>
              <Link to="/admin">Reservations</Link>
              <Link to="/admin/tables">Tables</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">My Reservations</Link>
              <Link to="/book">Book Table</Link>
            </>
          )}
          <span className="navbar-user">{user.name} ({user.role})</span>
          <button type="button" onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};
