import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>Restaurant Name</h5>
            <p>Delicious food, delivered to you</p>
            <div className="social-icons d-flex gap-3 mt-3">
              <a href="#" className="text-white">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-white">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-white">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/menu" className="text-white">Menu</Link>
              </li>
              <li>
                <Link to="/about" className="text-white">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-white">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Contact Us</h5>
            <address>
              <p>123 Restaurant Street</p>
              <p>City, State ZIP</p>
              <p>Phone: (123) 456-7890</p>
              <p>Email: info@restaurant.com</p>
            </address>
          </div>
        </div>
        <hr />
        <div className="text-center">
          <p className="mb-0">&copy; {year} Restaurant Name. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 