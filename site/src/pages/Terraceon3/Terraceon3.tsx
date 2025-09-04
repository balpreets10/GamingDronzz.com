import React, { useEffect, useState } from 'react';
import './Terraceon3.css';

const Terraceon3: React.FC = () => {
  const [navbarVisible, setNavbarVisible] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  // Add terrace-page class to body for CSS isolation
  useEffect(() => {
    document.body.classList.add('terrace-page');
    
    return () => {
      document.body.classList.remove('terrace-page');
    };
  }, []);

  const scrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 100) {
        if (scrollTop > lastScrollTop) {
          setNavbarVisible(false);
        } else {
          setNavbarVisible(true);
        }
      } else {
        setNavbarVisible(false);
      }
      setLastScrollTop(scrollTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const initializeAnimations = () => {
      const cards = document.querySelectorAll('.terrace-restaurant-card, .terrace-specialty-item, .terrace-contact-card, .terrace-about-highlight-card, .terrace-about-story, .terrace-about-vision');
      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
      });
    };

    initializeAnimations();

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="terrace">
      <div className="terrace-bg-pattern"></div>

      <nav className={`terrace-navbar ${navbarVisible ? 'visible' : ''}`}>
        <div className="terrace-navbar-content">
          <div className="terrace-navbar-logo">TERRACE ON 3</div>
          <div className="terrace-navbar-links">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }}>Home</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a>
            <a href="#restaurants" onClick={(e) => { e.preventDefault(); scrollTo('restaurants'); }}>Restaurants</a>
            <a href="#specialties" onClick={(e) => { e.preventDefault(); scrollTo('specialties'); }}>Specialties</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Contact</a>
          </div>
        </div>
      </nav>

      <section id="home" className="terrace-hero">
        <div className="terrace-hero-overlay"></div>
        <div className="terrace-hero-content">
          <div className="terrace-hero-main">
            <div className="terrace-hero-text">
              <div className="terrace-hero-logo">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvnvdtV15AJY-YKfA26sor_Nqth8MtmmRmqw&s"
                  alt="Terrace On 3 Logo" />
              </div>
              <div className="terrace-hero-text-content">
                <h1>TERRACE ON 3</h1>
                <p className="terrace-hero-subtitle">Jammu's Premier Rooftop Dining Destination</p>
                <p className="terrace-hero-description">
                  Experience elevated dining at 10,000 sq ft of breathtaking rooftop luxury with panoramic city views,
                  featuring three distinctive culinary concepts under one roof.
                </p>
              </div>
            </div>
            <div className="terrace-hero-actions">
              <button className="terrace-cta-btn terrace-cta-primary" onClick={() => scrollTo('restaurants')}>Explore Our Restaurants</button>
              <button className="terrace-cta-btn terrace-cta-secondary" onClick={() => scrollTo('contact')}>Make Reservation</button>
            </div>
          </div>
          
          <div className="terrace-hero-restaurants">
            <div className="terrace-restaurants-preview">
              <div className="terrace-restaurant-preview-card">
                <div className="terrace-preview-image">
                  <img src="https://content3.jdmagicbox.com/comp/jammu/s3/9999px191.x191.220901201512.l8s3/catalogue/lush-gourmet-kitchen-gandhinagar-jammu-jammu-restaurants-0eawvsyt0f.jpg" alt="Lush Gourmet Kitchen" />
                </div>
                <h3>LUSH GOURMET KITCHEN</h3>
                <p>Social Locale Eatery</p>
              </div>
              <div className="terrace-restaurant-preview-card">
                <div className="terrace-preview-image">
                  <img src="https://b.zmtcdn.com/data/pictures/5/20077495/204fa0d5be208643bf43e5db264d153c.jpg?fit=around|960:500&crop=960:500;*,*" alt="Tamarind Kitchen" />
                </div>
                <h3>TAMARIND KITCHEN</h3>
                <p>Authentic Indian Cuisine</p>
              </div>
              <div className="terrace-restaurant-preview-card">
                <div className="terrace-preview-image">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAF-Tl3Z5xnHXW4-QzvdfOx-fOLApOfBWxeA&s" alt="The White Plate Catering" />
                </div>
                <h3>THE WHITE PLATE</h3>
                <p>Premium Catering Services</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="terrace-about-section">
        <div className="terrace-about-content">
          <div className="terrace-about-header">
            <h2 className="terrace-about-title">About Terrace On 3</h2>
            <p className="terrace-about-subtitle">Jammu's Premier Rooftop Dining Experience</p>
          </div>
          
          <div className="terrace-about-main">
            <div className="terrace-about-story">
              <div className="terrace-about-text">
                <h3>Our Story</h3>
                <p>
                  Terrace On 3 stands as Jammu's most prestigious rooftop dining destination, offering an unparalleled 
                  culinary experience across 10,000 square feet of elegantly designed space. Perched high above the 
                  bustling streets of Gandhi Nagar, our restaurant provides breathtaking panoramic views of the city 
                  while delivering exceptional hospitality and world-class cuisine.
                </p>
                <p>
                  What sets us apart is our unique concept of housing three distinct dining experiences under one roof. 
                  Each restaurant within Terrace On 3 offers its own specialty, ambiance, and culinary expertise, 
                  ensuring that every visit brings a new adventure for your taste buds.
                </p>
              </div>
              <div className="terrace-about-image">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvnvdtV15AJY-YKfA26sor_Nqth8MtmmRmqw&s" 
                     alt="Terrace On 3 Rooftop View" />
              </div>
            </div>

            <div className="terrace-about-highlights">
              <div className="terrace-about-highlight-card">
                <div className="terrace-highlight-icon">🏢</div>
                <h4>10,000 Sq Ft</h4>
                <p>Jammu's largest rooftop restaurant offering spacious dining areas with stunning city views</p>
              </div>
              <div className="terrace-about-highlight-card">
                <div className="terrace-highlight-icon">🍽️</div>
                <h4>3 Unique Concepts</h4>
                <p>Three distinct restaurants offering diverse culinary experiences from gourmet to authentic Indian</p>
              </div>
              <div className="terrace-about-highlight-card">
                <div className="terrace-highlight-icon">👥</div>
                <h4>190+ Seating</h4>
                <p>Accommodate large groups and intimate gatherings with flexible seating arrangements</p>
              </div>
              <div className="terrace-about-highlight-card">
                <div className="terrace-highlight-icon">🌟</div>
                <h4>Premium Experience</h4>
                <p>Glass lift access, ambient lighting, and lush greenery create an enchanting atmosphere</p>
              </div>
            </div>

            <div className="terrace-about-vision">
              <h3>Our Vision</h3>
              <p>
                To redefine dining in Jammu by creating memorable experiences that combine exceptional cuisine, 
                breathtaking ambiance, and warm hospitality. We believe that every meal should be a celebration, 
                and every visit should leave you with cherished memories.
              </p>
              <div className="terrace-about-values">
                <div className="terrace-value-item">
                  <strong>Quality:</strong> Only the finest ingredients and expert culinary techniques
                </div>
                <div className="terrace-value-item">
                  <strong>Ambiance:</strong> Creating magical moments through thoughtful design and atmosphere
                </div>
                <div className="terrace-value-item">
                  <strong>Service:</strong> Exceeding expectations with genuine warmth and attention to detail
                </div>
                <div className="terrace-value-item">
                  <strong>Innovation:</strong> Continuously evolving our offerings to surprise and delight guests
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="restaurants" className="terrace-restaurants-section">
        <div className="terrace-section-header">
          <h2>Our Restaurant Collection</h2>
          <p>Three unique dining experiences, each crafted to perfection under the Terrace On 3 umbrella</p>
        </div>

        <div className="terrace-restaurants-grid">
          <div className="terrace-restaurant-card">
            <div className="terrace-card-image">
              <img src="https://content3.jdmagicbox.com/comp/jammu/s3/9999px191.x191.220901201512.l8s3/catalogue/lush-gourmet-kitchen-gandhinagar-jammu-jammu-restaurants-0eawvsyt0f.jpg"
                alt="Lush Gourmet Kitchen" />
              <div className="terrace-card-logo">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5lsZJusGXbnrOshE6FkCaimXlteN1eWDdrw&s"
                  alt="Lush Gourmet Logo" />
              </div>
            </div>
            <div className="terrace-card-content">
              <h3 className="terrace-card-title">LUSH GOURMET KITCHEN</h3>
              <p className="terrace-card-type">Social Locale Eatery</p>
              <p className="terrace-card-description">
                Elegant social dining with sophisticated gourmet cuisine. Perfect for intimate gatherings
                and culinary adventures in a refined setting.
              </p>
              <ul className="terrace-card-features">
                <li>Gourmet Chinese & International Cuisine</li>
                <li>Signature Mocktails & Beverages</li>
                <li>Elegant 2nd Floor Setting</li>
                <li>QR Menu & Modern Service</li>
                <li>Specializes in Dimsums & Tacos</li>
              </ul>
            </div>
          </div>

          <div className="terrace-restaurant-card">
            <div className="terrace-card-image">
              <img src="https://b.zmtcdn.com/data/pictures/5/20077495/204fa0d5be208643bf43e5db264d153c.jpg?fit=around|960:500&crop=960:500;*,*"
                alt="Tamarind Kitchen" />
              <div className="terrace-card-logo">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmD5lnfGqAcwEFkMbjDuYONMaAbxBbtarUrg&s"
                  alt="Tamarind Kitchen Logo" />
              </div>
            </div>
            <div className="terrace-card-content">
              <h3 className="terrace-card-title">TAMARIND KITCHEN</h3>
              <p className="terrace-card-type">Authentic Indian Cuisine</p>
              <p className="terrace-card-description">
                Authentic Indian flavors with modern refinement. From tandoor specialties to regional curries,
                experience the true essence of Indian hospitality.
              </p>
              <ul className="terrace-card-features">
                <li>Northern & South Indian Specialties</li>
                <li>Traditional Tandoor Cooking</li>
                <li>Indo-Chinese Fusion Menu</li>
                <li>Vegetarian & Vegan Options</li>
                <li>Craft Cocktails & Fine Wines</li>
              </ul>
            </div>
          </div>

          <div className="terrace-restaurant-card">
            <div className="terrace-card-image">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAF-Tl3Z5xnHXW4-QzvdfOx-fOLApOfBWxeA&s"
                alt="The White Plate Catering" />
              <div className="terrace-card-logo">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1aNxNtWDUOu2gpuyA6uFd505SbVeKVXagzQ&s"
                  alt="White Plate Logo" />
              </div>
            </div>
            <div className="terrace-card-content">
              <h3 className="terrace-card-title">THE WHITE PLATE</h3>
              <p className="terrace-card-type">Premium Catering Services</p>
              <p className="terrace-card-description">
                Professional catering services for all occasions. From intimate gatherings to grand
                celebrations, we bring restaurant-quality cuisine to your events.
              </p>
              <ul className="terrace-card-features">
                <li>Corporate Event Catering</li>
                <li>Wedding & Celebration Menus</li>
                <li>Custom Menu Planning</li>
                <li>Professional Service Staff</li>
                <li>Setup & Event Management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="specialties" className="terrace-specialties-section">
        <div className="terrace-specialties-content">
          <div className="terrace-specialties-header">
            <h2 className="terrace-specialties-title">Signature Experiences</h2>
            <p className="terrace-specialties-subtitle">
              Discover what makes Terrace On 3 Jammu's most celebrated dining destination
            </p>
          </div>

          <div className="terrace-specialties-grid">
            <div className="terrace-specialty-item">
              <div className="terrace-specialty-icon">
                <span className="terrace-icon-view">🌆</span>
              </div>
              <div className="terrace-specialty-content">
                <h4 className="terrace-specialty-title">Panoramic Views</h4>
                <p className="terrace-specialty-description">Breathtaking 360° city views from Jammu's largest rooftop restaurant</p>
              </div>
            </div>
            <div className="terrace-specialty-item">
              <div className="terrace-specialty-icon">
                <span className="terrace-icon-menu">🍽️</span>
              </div>
              <div className="terrace-specialty-content">
                <h4 className="terrace-specialty-title">330+ Menu Items</h4>
                <p className="terrace-specialty-description">Six diverse cuisines spanning international flavors and local favorites</p>
              </div>
            </div>
            <div className="terrace-specialty-item">
              <div className="terrace-specialty-icon">
                <span className="terrace-icon-entertainment">🎵</span>
              </div>
              <div className="terrace-specialty-content">
                <h4 className="terrace-specialty-title">Live Entertainment</h4>
                <p className="terrace-specialty-description">Wine tastings, live music, and curated dining experiences</p>
              </div>
            </div>
            <div className="terrace-specialty-item">
              <div className="terrace-specialty-icon">
                <span className="terrace-icon-ambiance">✨</span>
              </div>
              <div className="terrace-specialty-content">
                <h4 className="terrace-specialty-title">Ambient Setting</h4>
                <p className="terrace-specialty-description">Lush greenery, ambient lighting, and enchanting gazebo atmosphere</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="terrace-contact-section">
        <div className="terrace-contact-content">
          <div className="terrace-contact-header">
            <h2 className="terrace-contact-title">Visit Us</h2>
            <p className="terrace-contact-subtitle">
              Experience elevated dining at Jammu's premier rooftop destination
            </p>
          </div>

          <div className="terrace-contact-grid">
            <div className="terrace-contact-card terrace-main-location">
              <div className="terrace-contact-card-header">
                <div className="terrace-contact-icon">
                  <span>🏢</span>
                </div>
                <h3>MAIN RESTAURANT</h3>
              </div>
              <div className="terrace-contact-info">
                <div className="terrace-contact-detail">
                  <span className="terrace-detail-icon">📍</span>
                  <div>
                    <strong>Location</strong>
                    <p>Gandhi Nagar, Jammu</p>
                  </div>
                </div>
                <div className="terrace-contact-detail">
                  <span className="terrace-detail-icon">🏗️</span>
                  <div>
                    <strong>Floor</strong>
                    <p>3rd Floor (Glass Lift Access)</p>
                  </div>
                </div>
                <div className="terrace-contact-detail">
                  <span className="terrace-detail-icon">👥</span>
                  <div>
                    <strong>Seating</strong>
                    <p>190+ Guests</p>
                  </div>
                </div>
                <div className="terrace-contact-detail">
                  <span className="terrace-detail-icon">✨</span>
                  <div>
                    <strong>Experience</strong>
                    <p>Rooftop Dining</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="terrace-contact-card terrace-lush-location">
              <div className="terrace-contact-card-header">
                <div className="terrace-contact-icon">
                  <span>🍽️</span>
                </div>
                <h3>LUSH GOURMET KITCHEN</h3>
              </div>
              <div className="terrace-contact-info">
                <div className="terrace-contact-detail">
                  <span className="terrace-detail-icon">📍</span>
                  <div>
                    <strong>Location</strong>
                    <p>OM Tower, 2nd Floor<br />Bahu Plaza, Gandhi Nagar</p>
                  </div>
                </div>
                <div className="terrace-contact-detail">
                  <span className="terrace-detail-icon">⏰</span>
                  <div>
                    <strong>Hours</strong>
                    <p>12:00 PM - 11:30 PM</p>
                  </div>
                </div>
                <div className="terrace-contact-detail">
                  <span className="terrace-detail-icon">📞</span>
                  <div>
                    <strong>Reservations</strong>
                    <p>88999 53033</p>
                  </div>
                </div>
                <div className="terrace-contact-detail">
                  <span className="terrace-detail-icon">💬</span>
                  <div>
                    <strong>Delivery</strong>
                    <p>WhatsApp 88999 17033</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="terrace-contact-actions">
            <button
              className="terrace-contact-btn terrace-contact-primary"
              onClick={() => window.open('tel:+918899953033', '_self')}
            >
              <span className="terrace-btn-icon">📞</span>
              <span className="terrace-btn-text">Call for Reservations</span>
            </button>
            <button className="terrace-contact-btn terrace-contact-secondary">
              <span className="terrace-btn-icon">🍽️</span>
              <span className="terrace-btn-text">Book Table Online</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terraceon3;