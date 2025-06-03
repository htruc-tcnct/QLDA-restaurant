import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero bg-dark text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-4">Welcome to Our Restaurant</h1>
              <p className="lead">Experience the finest cuisine with our carefully crafted dishes.</p>
              <Link to="/menu" className="btn btn-primary btn-lg mt-3">View Our Menu</Link>
            </div>
            <div className="col-md-6">
              <img 
                src="https://placehold.co/600x400" 
                alt="Restaurant hero" 
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="featured py-5">
        <div className="container">
          <h2 className="text-center mb-4">Featured Dishes</h2>
          <div className="row">
            {[1, 2, 3].map((item) => (
              <div key={item} className="col-md-4 mb-4">
                <div className="card h-100">
                  <img 
                    src={`https://placehold.co/600x400?text=Dish+${item}`}
                    className="card-img-top" 
                    alt={`Featured dish ${item}`} 
                  />
                  <div className="card-body">
                    <h5 className="card-title">Featured Dish {item}</h5>
                    <p className="card-text">
                      A delicious dish prepared with the finest ingredients by our expert chefs.
                    </p>
                    <Link to="/menu" className="btn btn-outline-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <img 
                src="https://placehold.co/600x400?text=About+Us" 
                alt="About our restaurant" 
                className="img-fluid rounded"
              />
            </div>
            <div className="col-md-6">
              <h2>About Our Restaurant</h2>
              <p className="lead">
                We are dedicated to providing an exceptional dining experience with authentic cuisine.
              </p>
              <p>
                Our restaurant was founded with a passion for great food and exceptional service. 
                Our chefs bring years of experience and a love for culinary excellence to every dish.
              </p>
              <Link to="/about" className="btn btn-outline-dark mt-3">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 