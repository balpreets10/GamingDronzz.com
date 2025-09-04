import React, { useState, useEffect } from 'react';
import './SoulFit.css';

const SoulFit: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(false);

  useEffect(() => {
    document.body.classList.add('soulfit-page');
    
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 100) {
        if (scrollY < lastScrollY) {
          setIsNavbarVisible(true);
        } else {
          setIsNavbarVisible(false);
        }
      } else {
        setIsNavbarVisible(false);
      }
      
      lastScrollY = scrollY;
    };

    const observerOptions = {
      threshold: 0.6,
      rootMargin: '-50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('soulfit-animate-in');
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.soulfit-animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));

    window.addEventListener('scroll', handleScroll);

    return () => {
      document.body.classList.remove('soulfit-page');
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="soulfit-container">
      <nav className={`soulfit-navbar ${isNavbarVisible ? 'soulfit-navbar-visible' : ''}`}>
        <div className="soulfit-navbar-content">
          <div className="soulfit-logo">Soul.Fit</div>
          <ul className="soulfit-nav-links">
            <li><button onClick={() => scrollToSection('home')} className={activeSection === 'home' ? 'soulfit-active' : ''}>Home</button></li>
            <li><button onClick={() => scrollToSection('about')} className={activeSection === 'about' ? 'soulfit-active' : ''}>About</button></li>
            <li><button onClick={() => scrollToSection('equipment')} className={activeSection === 'equipment' ? 'soulfit-active' : ''}>Equipment</button></li>
            <li><button onClick={() => scrollToSection('packages')} className={activeSection === 'packages' ? 'soulfit-active' : ''}>Packages</button></li>
            <li><button onClick={() => scrollToSection('contact')} className={activeSection === 'contact' ? 'soulfit-active' : ''}>Contact</button></li>
          </ul>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="soulfit-home-section">
        <div className="soulfit-hero-content">
          <div className="soulfit-hero-text">
            <h1 className="soulfit-hero-title">Transform Your Body<br />Transform Your Life</h1>
            <p className="soulfit-hero-subtitle">Welcome to Soul.Fit - Jammu's Premier Fitness Destination</p>
            <p className="soulfit-hero-description">
              Where strength meets soul. Join our community of fitness enthusiasts and embark on your journey to a healthier, stronger you.
            </p>
            <div className="soulfit-hero-buttons">
              <button onClick={() => scrollToSection('packages')} className="soulfit-cta-primary">Start Your Journey</button>
              <button onClick={() => scrollToSection('about')} className="soulfit-cta-secondary">Learn More</button>
            </div>
          </div>
          <div className="soulfit-hero-image">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Modern gym interior" />
          </div>
        </div>
        
        <div className="soulfit-features-preview">
          <div className="soulfit-feature-card soulfit-animate-on-scroll">
            <div className="soulfit-feature-icon">=ª</div>
            <h3>Strength Training</h3>
            <p>State-of-the-art equipment for all fitness levels</p>
          </div>
          <div className="soulfit-feature-card soulfit-animate-on-scroll">
            <div className="soulfit-feature-icon">d</div>
            <h3>Cardio Zone</h3>
            <p>Premium cardio equipment with entertainment systems</p>
          </div>
          <div className="soulfit-feature-card soulfit-animate-on-scroll">
            <div className="soulfit-feature-icon">=e</div>
            <h3>Personal Training</h3>
            <p>Certified trainers to guide your fitness journey</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="soulfit-about-section">
        <div className="soulfit-section-content">
          <div className="soulfit-about-header soulfit-animate-on-scroll">
            <h2 className="soulfit-section-title">About Soul.Fit</h2>
            <p className="soulfit-section-subtitle">More than just a gym - we're your fitness family</p>
          </div>
          
          <div className="soulfit-about-grid">
            <div className="soulfit-about-story soulfit-animate-on-scroll">
              <h3>Our Story</h3>
              <p>
                Established with a vision to revolutionize fitness culture in Jammu, Soul.Fit has been empowering individuals 
                to achieve their health and wellness goals since our inception. We believe that fitness is not just about 
                physical transformation but about nurturing the soul within.
              </p>
              <p>
                Our state-of-the-art facility combines modern equipment with a supportive community atmosphere, 
                creating the perfect environment for your fitness journey.
              </p>
            </div>
            
            <div className="soulfit-about-mission soulfit-animate-on-scroll">
              <h3>Our Mission</h3>
              <ul className="soulfit-mission-list">
                <li>Provide world-class fitness facilities and equipment</li>
                <li>Create a supportive and inclusive community</li>
                <li>Offer personalized training programs for all levels</li>
                <li>Promote holistic health and wellness</li>
                <li>Inspire lifelong fitness habits</li>
              </ul>
            </div>
          </div>
          
          <div className="soulfit-stats soulfit-animate-on-scroll">
            <div className="soulfit-stat-item">
              <div className="soulfit-stat-number">500+</div>
              <div className="soulfit-stat-label">Active Members</div>
            </div>
            <div className="soulfit-stat-item">
              <div className="soulfit-stat-number">10+</div>
              <div className="soulfit-stat-label">Certified Trainers</div>
            </div>
            <div className="soulfit-stat-item">
              <div className="soulfit-stat-number">5</div>
              <div className="soulfit-stat-label">Years Experience</div>
            </div>
            <div className="soulfit-stat-item">
              <div className="soulfit-stat-number">24/7</div>
              <div className="soulfit-stat-label">Access Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Section */}
      <section id="equipment" className="soulfit-equipment-section">
        <div className="soulfit-section-content">
          <div className="soulfit-section-header soulfit-animate-on-scroll">
            <h2 className="soulfit-section-title">World-Class Equipment</h2>
            <p className="soulfit-section-subtitle">Premium equipment for every workout style</p>
          </div>
          
          <div className="soulfit-equipment-grid">
            <div className="soulfit-equipment-card soulfit-animate-on-scroll">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Free weights area" />
              <div className="soulfit-equipment-content">
                <h3>Free Weights Zone</h3>
                <ul>
                  <li>Complete dumbbell set (5-100 lbs)</li>
                  <li>Olympic barbells and plates</li>
                  <li>Power racks and squat stations</li>
                  <li>Adjustable benches</li>
                </ul>
              </div>
            </div>
            
            <div className="soulfit-equipment-card soulfit-animate-on-scroll">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Cardio equipment" />
              <div className="soulfit-equipment-content">
                <h3>Cardio Equipment</h3>
                <ul>
                  <li>Latest treadmills with touchscreen displays</li>
                  <li>Elliptical machines and stationary bikes</li>
                  <li>Rowing machines</li>
                  <li>Stair climbers</li>
                </ul>
              </div>
            </div>
            
            <div className="soulfit-equipment-card soulfit-animate-on-scroll">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Strength machines" />
              <div className="soulfit-equipment-content">
                <h3>Strength Machines</h3>
                <ul>
                  <li>Pin-loaded strength machines</li>
                  <li>Cable crossover systems</li>
                  <li>Smith machines</li>
                  <li>Leg press and calf raise machines</li>
                </ul>
              </div>
            </div>
            
            <div className="soulfit-equipment-card soulfit-animate-on-scroll">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Functional training area" />
              <div className="soulfit-equipment-content">
                <h3>Functional Training</h3>
                <ul>
                  <li>TRX suspension trainers</li>
                  <li>Battle ropes and kettlebells</li>
                  <li>Medicine balls and agility equipment</li>
                  <li>Plyometric boxes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="soulfit-packages-section">
        <div className="soulfit-section-content">
          <div className="soulfit-section-header soulfit-animate-on-scroll">
            <h2 className="soulfit-section-title">Membership Packages</h2>
            <p className="soulfit-section-subtitle">Choose the perfect plan for your fitness journey</p>
          </div>
          
          <div className="soulfit-packages-grid">
            <div className="soulfit-package-card soulfit-animate-on-scroll">
              <div className="soulfit-package-header">
                <h3>Basic</h3>
                <div className="soulfit-package-price">
                  <span className="soulfit-price">¹2,500</span>
                  <span className="soulfit-period">/month</span>
                </div>
              </div>
              <div className="soulfit-package-features">
                <ul>
                  <li> Full gym access</li>
                  <li> All equipment usage</li>
                  <li> Locker facility</li>
                  <li> Basic fitness consultation</li>
                  <li> Personal training</li>
                  <li> Nutrition guidance</li>
                </ul>
              </div>
              <button className="soulfit-package-btn">Choose Plan</button>
            </div>
            
            <div className="soulfit-package-card soulfit-package-featured soulfit-animate-on-scroll">
              <div className="soulfit-package-badge">Most Popular</div>
              <div className="soulfit-package-header">
                <h3>Premium</h3>
                <div className="soulfit-package-price">
                  <span className="soulfit-price">¹4,000</span>
                  <span className="soulfit-period">/month</span>
                </div>
              </div>
              <div className="soulfit-package-features">
                <ul>
                  <li> Full gym access</li>
                  <li> All equipment usage</li>
                  <li> Locker facility</li>
                  <li> Personal training (4 sessions/month)</li>
                  <li> Nutrition guidance</li>
                  <li> Group classes access</li>
                </ul>
              </div>
              <button className="soulfit-package-btn soulfit-package-btn-featured">Choose Plan</button>
            </div>
            
            <div className="soulfit-package-card soulfit-animate-on-scroll">
              <div className="soulfit-package-header">
                <h3>VIP</h3>
                <div className="soulfit-package-price">
                  <span className="soulfit-price">¹6,500</span>
                  <span className="soulfit-period">/month</span>
                </div>
              </div>
              <div className="soulfit-package-features">
                <ul>
                  <li> Full gym access</li>
                  <li> All equipment usage</li>
                  <li> Premium locker facility</li>
                  <li> Unlimited personal training</li>
                  <li> Custom nutrition plan</li>
                  <li> All group classes</li>
                  <li> Body composition analysis</li>
                </ul>
              </div>
              <button className="soulfit-package-btn">Choose Plan</button>
            </div>
          </div>
          
          <div className="soulfit-package-note soulfit-animate-on-scroll">
            <p>All packages include complimentary fitness assessment and goal setting session</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="soulfit-contact-section">
        <div className="soulfit-section-content">
          <div className="soulfit-section-header soulfit-animate-on-scroll">
            <h2 className="soulfit-section-title">Get In Touch</h2>
            <p className="soulfit-section-subtitle">Ready to start your fitness journey?</p>
          </div>
          
          <div className="soulfit-contact-grid">
            <div className="soulfit-contact-info soulfit-animate-on-scroll">
              <div className="soulfit-contact-card">
                <div className="soulfit-contact-icon">=Í</div>
                <h3>Location</h3>
                <p>Main Branch<br />Gandhi Nagar, Jammu<br />Jammu & Kashmir 180004</p>
              </div>
              
              <div className="soulfit-contact-card">
                <div className="soulfit-contact-icon">ð</div>
                <h3>Hours</h3>
                <p>Monday - Saturday: 5:00 AM - 11:00 PM<br />Sunday: 6:00 AM - 10:00 PM<br />24/7 Access for Premium & VIP members</p>
              </div>
              
              <div className="soulfit-contact-card">
                <div className="soulfit-contact-icon">=Þ</div>
                <h3>Contact</h3>
                <p>Phone: +91 9876543210<br />Email: info@soulfit.com<br />WhatsApp: +91 9876543210</p>
              </div>
            </div>
            
            <div className="soulfit-contact-form soulfit-animate-on-scroll">
              <form className="soulfit-form">
                <div className="soulfit-form-group">
                  <input type="text" placeholder="Your Name" className="soulfit-form-input" />
                </div>
                <div className="soulfit-form-group">
                  <input type="email" placeholder="Your Email" className="soulfit-form-input" />
                </div>
                <div className="soulfit-form-group">
                  <input type="tel" placeholder="Your Phone" className="soulfit-form-input" />
                </div>
                <div className="soulfit-form-group">
                  <select className="soulfit-form-input">
                    <option>Select Package Interest</option>
                    <option>Basic Package</option>
                    <option>Premium Package</option>
                    <option>VIP Package</option>
                  </select>
                </div>
                <div className="soulfit-form-group">
                  <textarea placeholder="Your Message" className="soulfit-form-input soulfit-form-textarea"></textarea>
                </div>
                <button type="submit" className="soulfit-form-submit">Send Message</button>
              </form>
            </div>
          </div>
          
          <div className="soulfit-social-links soulfit-animate-on-scroll">
            <h3>Follow Us</h3>
            <div className="soulfit-social-icons">
              <a href="https://www.facebook.com/soul.fit.jammu/" target="_blank" rel="noopener noreferrer" className="soulfit-social-link">
                <span>Facebook</span>
              </a>
              <a href="https://www.instagram.com/soul.fit.jammu/" target="_blank" rel="noopener noreferrer" className="soulfit-social-link">
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SoulFit;