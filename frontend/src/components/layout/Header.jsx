import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaHeart, FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaList } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="bg-dark text-white py-3">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="logo">
            <Link to="/" className="text-white text-decoration-none">
              <h1 className="m-0">Restaurant Name</h1>
              <p className="mb-0">Delicious food, delivered to you</p>
            </Link>
          </div>
          <nav>
            <ul className="list-unstyled d-flex gap-4 mb-0">
              <li>
                <Link to="/" className="text-white">Home</Link>
              </li>
              <li>
                <Link to="/menu" className="text-white">Menu</Link>
              </li>
              <li>
                <Link to="/booking" className="text-white">Đặt bàn</Link>
              </li>
              <li>
                <Link to="/about" className="text-white">About</Link>
              </li>
              <li>
                <Link to="/contact" className="text-white">Contact</Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link to="/favorites" className="text-white">Favorites</Link>
                  </li>
                  <li>
                    <Link to="/my-bookings" className="text-white">Đặt bàn của tôi</Link>
                  </li>
                </>
              )}
              {isAuthenticated && user?.role && (user.role === 'admin' || user.role === 'manager' || user.role === 'chef') && (
                <li>
                  <Link to="/admin" className="text-white">Admin Panel</Link>
                </li>
              )}
            </ul>
          </nav>
          <div className="d-flex gap-3">
            {isAuthenticated && (
              <Link to="/favorites" className="text-white" title="My Favorites">
                <FaHeart size={24} />
              </Link>
            )}
            <Link to="/cart" className="text-white" title="Cart">
              <FaShoppingCart size={24} />
            </Link>
            {isAuthenticated ? (
              <div className="dropdown">
                <div className="text-white dropdown-toggle" style={{ cursor: 'pointer' }} id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <FaUser size={24} />
                </div>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><span className="dropdown-item-text">Hello, {user?.fullName || user?.username}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><Link className="dropdown-item" to="/favorites">My Favorites</Link></li>
                  <li><Link className="dropdown-item" to="/my-bookings"><FaCalendarAlt className="me-2" />Đặt bàn của tôi</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={logout}>Logout <FaSignOutAlt className="ms-1" /></button></li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="text-white" title="Login">
                <FaSignInAlt size={24} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 