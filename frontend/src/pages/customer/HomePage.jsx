import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const ALL_MENU_IMAGE_URLS = [
  '/images/menu/Bào Ngư Sốt Dầu Hào/pixabay_1255020_06.jpg',
  '/images/menu/Bào Ngư Sốt Dầu Hào/pixabay_2495964_02.jpg',
  '/images/menu/Bò Wagyu Nướng/pixabay_1648603_01.jpg',
  '/images/menu/Bò Wagyu Nướng/pixabay_3139641_04.jpg',
  '/images/menu/Bò Wagyu Nướng/pixabay_3640560_02.jpg',
  '/images/menu/Bồ Câu Quay Da Giòn/pixabay_1265174_04.jpg',
  '/images/menu/Bồ Câu Quay Da Giòn/pixabay_1508975_02.jpg',
  '/images/menu/Bồ Câu Quay Da Giòn/pixabay_1712626_01.jpg',
  '/images/menu/Chân Cua Hoàng Đế Hấp/pixabay_1532115_01.jpg',
  '/images/menu/Chân Cua Hoàng Đế Hấp/pixabay_614628_06.jpg',
  '/images/menu/Chả Giò Hải Sản Cao Cấp/pixabay_2186506_01.jpg',
  '/images/menu/Chả Giò Hải Sản Cao Cấp/pixabay_2186520_06.jpg',
  '/images/menu/Cá Song Hấp Xì Dầu/pixabay_1508984_04.jpg',
  '/images/menu/Cá Song Hấp Xì Dầu/pixabay_2147040_03.jpg',
  '/images/menu/Cá Tuyết Hấp Gừng Hành/pixabay_6902892_01.jpg',
  '/images/menu/Cá Tuyết Hấp Gừng Hành/pixabay_6902999_06.jpg',
  '/images/menu/Cơm Chiên Tôm Càng Vua/pixabay_2509046_06.jpg',
  '/images/menu/Cơm Chiên Tôm Càng Vua/pixabay_5312128_03.jpg',
  '/images/menu/Cơm Chiên Tôm Càng Vua/pixabay_967081_02.jpg',
  '/images/menu/Gỏi Hải Sản Cao Cấp/pixabay_2455281_02.jpg',
  '/images/menu/Gỏi Hải Sản Cao Cấp/pixabay_518032_01.jpg',
  '/images/menu/Gỏi Hải Sản Cao Cấp/pixabay_522483_04.jpg',
  '/images/menu/Heo Sữa Quay Da Giòn/pixabay_2480295_01.jpg',
  '/images/menu/Heo Sữa Quay Da Giòn/pixabay_852042_03.jpg',
  '/images/menu/Lẩu Nấm Thiên Nhiên Cao Cấp/pixabay_2426889_06.jpg',
  '/images/menu/Lẩu Nấm Thiên Nhiên Cao Cấp/pixabay_2426891_02.jpg',
  '/images/menu/Lẩu Nấm Thiên Nhiên Cao Cấp/pixabay_6764962_04.jpg',
  '/images/menu/pan-seared_foie_gras_with_berry_sauce/pixabay_2210465_02.jpg',
  '/images/menu/pan-seared_foie_gras_with_berry_sauce/pixabay_4977312_04.jpg',
  '/images/menu/pan-seared_foie_gras_with_berry_sauce/pixabay_4977313_03.jpg',
  '/images/menu/stir-fried_glass_noodles_with_crab/pixabay_6405452_02.jpg',
  '/images/menu/stir-fried_glass_noodles_with_crab/pixabay_906248_07.jpg',
  '/images/menu/Sườn Cừu Nướng Lá Hương Thảo/pixabay_1095653_03.jpg',
  '/images/menu/Sườn Cừu Nướng Lá Hương Thảo/pixabay_282865_07.jpg',
  '/images/menu/Sườn Cừu Nướng Lá Hương Thảo/pixabay_656410_05.jpg',
  '/images/menu/Tôm Càng Xanh Sốt Me/pixabay_4773380_05.jpg',
  '/images/menu/Tôm Càng Xanh Sốt Me/pixabay_6523368_02.jpg',
  '/images/menu/Tôm Hùm Nướng Bơ Tỏi/pixabay_3535048_04.jpg',
  '/images/menu/Tôm Hùm Nướng Bơ Tỏi/pixabay_74258_07.jpg',
  '/images/menu/Vịt Quay Bắc Kinh/pixabay_2629784_02.jpg',
  '/images/menu/Vịt Quay Bắc Kinh/pixabay_6826022_01.jpg',
  '/images/menu/Vịt Quay Bắc Kinh/pixabay_898500_04.jpg',
  '/images/menu/Đĩa Sashimi Cá Hồi Tươi/pixabay_1957234_02.jpg',
  '/images/menu/Đĩa Sashimi Cá Hồi Tươi/pixabay_471787_05.jpg',
  '/images/menu/Đĩa Sashimi Cá Hồi Tươi/pixabay_471795_06.jpg',
  '/images/menu/Đĩa Tráng Miệng Việt Cao Cấp/pixabay_5582984_01.jpg',
  '/images/menu/Đĩa Tráng Miệng Việt Cao Cấp/pixabay_5771746_04.jpg',
  '/images/menu/Đĩa Tráng Miệng Việt Cao Cấp/pixabay_6773324_07.jpg'
];

const HomePage = () => {
  const [homePageDishes, setHomePageDishes] = useState([]);

  useEffect(() => {
    const fetchHomePageDishes = async () => {
      try {
        // Fetch up to 10 items to ensure variety
        const { data } = await api.get('/api/menu-items', {
          params: { limit: 10, page: 1 }
        });
        let dishes = data.menuItems || [];

        // Shuffle the array to get random dishes
        const shuffled = dishes.sort(() => 0.5 - Math.random());
        
        setHomePageDishes(shuffled.slice(0, 5)); // Take the first 5 for the page
      } catch (error) {
        console.error("Failed to fetch dishes for homepage:", error);
        setHomePageDishes([]);
      }
    };
    fetchHomePageDishes();
  }, []);

  const getImageUrl = (url) => {
    if (url && url.startsWith('/')) {
      return `http://localhost:5000${encodeURI(url)}`;
    }
    if (url) {
      return encodeURI(url);
    }
    // Return a random image if no URL
    const randomIndex = Math.floor(Math.random() * ALL_MENU_IMAGE_URLS.length);
    return `http://localhost:5000${encodeURI(ALL_MENU_IMAGE_URLS[randomIndex])}`;
  };

  const heroDish = homePageDishes[0];
  const featuredDishes = homePageDishes.slice(1, 4);
  const aboutDish = homePageDishes[4];

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
                src={getImageUrl(heroDish?.imageUrls[0])}
                alt="Restaurant hero" 
                className="img-fluid rounded"
                style={{ aspectRatio: '3/2', objectFit: 'cover' }}
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
            {featuredDishes.length > 0 ? featuredDishes.map((item) => (
              <div key={item._id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <img 
                    src={getImageUrl(item.imageUrls?.[0])}
                    className="card-img-top" 
                    alt={item.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(null); }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text">
                      {item.description 
                        ? (item.description.length > 100 ? item.description.substring(0, 97) + '...' : item.description)
                        : 'A delicious dish prepared with the finest ingredients by our expert chefs.'}
                    </p>
                    <Link to={`/menu?dish=${item._id}`} className="btn btn-outline-primary">
                      View More
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              // Placeholder skeleton loaders
              [1, 2, 3].map(i => (
                <div key={i} className="col-md-4 mb-4">
                  <div className="card h-100" aria-hidden="true">
                    <div className="card-img-top" style={{ height: '200px', backgroundColor: '#e9ecef' }}></div>
                    <div className="card-body">
                      <h5 className="card-title placeholder-glow"><span className="placeholder col-6"></span></h5>
                      <p className="card-text placeholder-glow">
                        <span className="placeholder col-7"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-6"></span>
                      </p>
                      <a href="#" tabIndex="-1" className="btn btn-outline-primary disabled placeholder col-6"></a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <img 
                src={getImageUrl(aboutDish?.imageUrls[0])} 
                alt="About our restaurant" 
                className="img-fluid rounded"
                style={{ aspectRatio: '3/2', objectFit: 'cover' }}
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