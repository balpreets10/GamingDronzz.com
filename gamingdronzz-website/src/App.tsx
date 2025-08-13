import { useEffect, useState } from 'react';
import ModernNavigation from './components/navigation/ModernNavigation';
import Preloader from './components/ui/Preloader';
import useNavigation, { useNavigationEvents } from './hooks/useNavigation';
import ScrollManager from './managers/ScrollManager';
import PerformanceManager from './managers/PerformanceManager';
import { initAutoThemeRotation, ThemeOption } from './utils/helpers';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeOption | null>(null);

  const { state: navState, actions: navActions } = useNavigation({
    customConfig: {
      items: [
        { id: 'home', label: 'Home', href: '#home', position: 0 },
        { id: 'about', label: 'About', href: '#about', position: 1 },
        { id: 'projects', label: 'Projects', href: '#projects', position: 2 },
        { id: 'services', label: 'Services', href: '#services', position: 3 },
        { id: 'articles', label: 'Articles', href: '#articles', position: 4 },
        { id: 'contact', label: 'Contact', href: '#contact', position: 5 }
      ]
    }
  });

  // Initialize managers and auto-theme rotation once
  useEffect(() => {
    const scrollManager = ScrollManager.getInstance();
    const performanceManager = PerformanceManager.getInstance();

    performanceManager.startMark('app-init');

    // Initialize auto theme rotation - this will pick a random theme on each refresh
    const selectedTheme = initAutoThemeRotation();
    setCurrentTheme(selectedTheme);

    // Optional: Add smooth theme transition class to body
    document.body.classList.add('theme-transition');

    // Cleanup function
    return () => {
      scrollManager.destroy();
      performanceManager.destroy();
      document.body.classList.remove('theme-transition');
    };
  }, []);

  // Analytics tracking - stable callback
  useNavigationEvents('navigate', (event) => {
    console.log('Navigation event:', event);
  }, []); // Empty deps array

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    // Trigger any post-load animations or effects here
    document.body.classList.add('app-loaded');
  };

  if (isLoading) {
    return (
      <Preloader
        onComplete={handlePreloaderComplete}
        duration={1200} // Reduced from 2000ms
        minDisplayTime={800} // Reduced from 1500ms
      />
    );
  }

  return (
    <div className="app">
      {/* Modern Navigation - Jack Elder inspired */}
      <ModernNavigation
        position="fixed-top"
        onNavigate={navActions.navigate}
      />

      <main className="app__main">
        <section id="home" className="app__section app__section--hero">
          <div className="app__container">
            <h1 className="app__hero-title">
              Welcome to Gaming<span className="app__brand">Dronzz</span>
            </h1>
            <p className="app__hero-subtitle">
              Professional Game Development Consultancy & Services
            </p>
            {currentTheme && (
              <div className="app__theme-indicator">
                <span className="app__theme-emoji">{currentTheme.icon}</span>
                <span className="app__theme-name">
                  Today's Theme: {currentTheme.name}
                </span>
              </div>
            )}
            <div className="app__hero-cta">
              <button
                className="app__button app__button--primary"
                onClick={() => navActions.navigate('contact')}
              >
                Get Started
              </button>
              <button
                className="app__button app__button--secondary"
                onClick={() => navActions.navigate('projects')}
              >
                View Projects
              </button>
            </div>
          </div>
        </section>

        <section id="about" className="app__section">
          <div className="app__container">
            <h2 className="app__section-title">About Us</h2>
            <p className="app__section-text">
              We are a team of experienced game developers and consultants dedicated to
              helping you bring your gaming vision to life. With expertise across multiple
              platforms and technologies, we deliver high-quality solutions tailored to
              your specific needs.
            </p>
            <div className="app__features-grid">
              <div className="app__feature">
                <h3>Expert Team</h3>
                <p>Seasoned professionals with 10+ years experience</p>
              </div>
              <div className="app__feature">
                <h3>Cutting-Edge Tech</h3>
                <p>Latest tools and frameworks for optimal performance</p>
              </div>
              <div className="app__feature">
                <h3>Client-Focused</h3>
                <p>Tailored solutions that exceed expectations</p>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="app__section app__section--dark">
          <div className="app__container">
            <h2 className="app__section-title">Featured Projects</h2>
            <div className="app__projects-grid">
              <div className="app__project-card">
                <div className="app__project-image">
                  <div className="app__project-placeholder">🎮</div>
                </div>
                <h3 className="app__project-title">Project Alpha</h3>
                <p className="app__project-description">
                  A next-generation mobile RPG with immersive storytelling and cutting-edge graphics.
                </p>
                <div className="app__project-tags">
                  <span className="app__tag">Unity</span>
                  <span className="app__tag">Mobile</span>
                  <span className="app__tag">RPG</span>
                </div>
              </div>
              <div className="app__project-card">
                <div className="app__project-image">
                  <div className="app__project-placeholder">⚔️</div>
                </div>
                <h3 className="app__project-title">Project Beta</h3>
                <p className="app__project-description">
                  Cross-platform multiplayer strategy game with real-time combat and epic battles.
                </p>
                <div className="app__project-tags">
                  <span className="app__tag">Unreal</span>
                  <span className="app__tag">Multiplayer</span>
                  <span className="app__tag">Strategy</span>
                </div>
              </div>
              <div className="app__project-card">
                <div className="app__project-image">
                  <div className="app__project-placeholder">🥽</div>
                </div>
                <h3 className="app__project-title">Project Gamma</h3>
                <p className="app__project-description">
                  VR experience pushing the boundaries of interactive entertainment and immersion.
                </p>
                <div className="app__project-tags">
                  <span className="app__tag">VR</span>
                  <span className="app__tag">WebGL</span>
                  <span className="app__tag">Interactive</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="app__section">
          <div className="app__container">
            <h2 className="app__section-title">Our Services</h2>
            <div className="app__services-grid">
              <div className="app__service-item">
                <div className="app__service-icon">🎨</div>
                <h3 className="app__service-title">Game Design</h3>
                <p className="app__service-description">
                  Complete game design from concept to final implementation, ensuring engaging gameplay.
                </p>
                <ul className="app__service-features">
                  <li>Concept Development</li>
                  <li>Gameplay Mechanics</li>
                  <li>Level Design</li>
                  <li>User Experience</li>
                </ul>
              </div>
              <div className="app__service-item">
                <div className="app__service-icon">⚙️</div>
                <h3 className="app__service-title">Development</h3>
                <p className="app__service-description">
                  Full-stack game development using cutting-edge technologies and best practices.
                </p>
                <ul className="app__service-features">
                  <li>Unity & Unreal Engine</li>
                  <li>Mobile Development</li>
                  <li>Web Games</li>
                  <li>Backend Systems</li>
                </ul>
              </div>
              <div className="app__service-item">
                <div className="app__service-icon">📊</div>
                <h3 className="app__service-title">Consulting</h3>
                <p className="app__service-description">
                  Strategic consulting to optimize your game development process and maximize success.
                </p>
                <ul className="app__service-features">
                  <li>Technical Architecture</li>
                  <li>Performance Optimization</li>
                  <li>Team Training</li>
                  <li>Market Analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="articles" className="app__section app__section--light">
          <div className="app__container">
            <h2 className="app__section-title">Latest Articles</h2>
            <div className="app__articles-grid">
              <article className="app__article-card">
                <div className="app__article-category">Mobile Gaming</div>
                <h3 className="app__article-title">The Future of Mobile Gaming</h3>
                <p className="app__article-excerpt">
                  Exploring emerging trends and technologies shaping the mobile gaming landscape,
                  from AR integration to cloud gaming solutions...
                </p>
                <div className="app__article-meta">
                  <time className="app__article-date">March 15, 2024</time>
                  <span className="app__article-read-time">5 min read</span>
                </div>
              </article>
              <article className="app__article-card">
                <div className="app__article-category">Performance</div>
                <h3 className="app__article-title">Optimizing Game Performance</h3>
                <p className="app__article-excerpt">
                  Best practices for maintaining smooth gameplay across different devices,
                  covering memory management, rendering optimization, and more...
                </p>
                <div className="app__article-meta">
                  <time className="app__article-date">March 10, 2024</time>
                  <span className="app__article-read-time">8 min read</span>
                </div>
              </article>
              <article className="app__article-card">
                <div className="app__article-category">Industry</div>
                <h3 className="app__article-title">Game Development Trends 2024</h3>
                <p className="app__article-excerpt">
                  A comprehensive look at the latest trends in game development,
                  from AI-assisted design to sustainable development practices...
                </p>
                <div className="app__article-meta">
                  <time className="app__article-date">March 5, 2024</time>
                  <span className="app__article-read-time">6 min read</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="contact" className="app__section app__section--contact">
          <div className="app__container">
            <h2 className="app__section-title">Get In Touch</h2>
            <p className="app__section-text">
              Ready to start your next gaming project? We'd love to hear from you and discuss
              how we can bring your vision to life.
            </p>
            <div className="app__contact-info">
              <div className="app__contact-methods">
                <div className="app__contact-method">
                  <div className="app__contact-icon">📧</div>
                  <div>
                    <h4>Email Us</h4>
                    <p>hello@gamingdronzz.com</p>
                  </div>
                </div>
                <div className="app__contact-method">
                  <div className="app__contact-icon">📞</div>
                  <div>
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="app__contact-method">
                  <div className="app__contact-icon">💬</div>
                  <div>
                    <h4>Live Chat</h4>
                    <p>Available Mon-Fri 9AM-6PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="app__contact-cta">
              <button
                className="app__button app__button--primary app__button--large"
                onClick={() => window.location.href = 'mailto:hello@gamingdronzz.com?subject=Project Inquiry'}
              >
                Start Your Project
              </button>
              <button
                className="app__button app__button--secondary app__button--large"
                onClick={() => window.location.href = 'tel:+15551234567'}
              >
                Schedule a Call
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app__footer">
        <div className="app__container">
          <div className="app__footer-content">
            <div className="app__footer-brand">
              <h3>GamingDronzz</h3>
              <p>Crafting exceptional gaming experiences</p>
            </div>
            <div className="app__footer-links">
              <div className="app__footer-section">
                <h4>Services</h4>
                <ul>
                  <li><a href="#services">Game Design</a></li>
                  <li><a href="#services">Development</a></li>
                  <li><a href="#services">Consulting</a></li>
                </ul>
              </div>
              <div className="app__footer-section">
                <h4>Company</h4>
                <ul>
                  <li><a href="#about">About</a></li>
                  <li><a href="#projects">Projects</a></li>
                  <li><a href="#articles">Blog</a></li>
                </ul>
              </div>
              <div className="app__footer-section">
                <h4>Connect</h4>
                <ul>
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="mailto:hello@gamingdronzz.com">Email</a></li>
                  <li><a href="tel:+15551234567">Phone</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="app__footer-bottom">
            <p>&copy; 2024 GamingDronzz. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {import.meta.env.DEV && (
        <div className="app__debug">
          <details>
            <summary>Navigation Debug</summary>
            <pre>{JSON.stringify(navState, null, 2)}</pre>
          </details>
          {currentTheme && (
            <details>
              <summary>Theme Debug</summary>
              <pre>{JSON.stringify(currentTheme, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export default App;