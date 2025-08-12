import { useEffect } from 'react';
import RadialMenu from './components/navigation/RadialMenu';
import useNavigation, { useNavigationEvents } from './hooks/useNavigation';
import ScrollManager from './managers/ScrollManager';
import PerformanceManager from './managers/PerformanceManager';
import './App.css';

function App() {
  const { state: navState, actions: navActions } = useNavigation({
    customConfig: {
      items: [
        { id: 'home', label: 'Home', href: '#home', icon: '🏠', position: 0 },
        { id: 'about', label: 'About', href: '#about', icon: '👋', position: 1 },
        { id: 'projects', label: 'Projects', href: '#projects', icon: '🎮', position: 2 },
        { id: 'services', label: 'Services', href: '#services', icon: '⚡', position: 3 },
        { id: 'articles', label: 'Articles', href: '#articles', icon: '📝', position: 4 },
        { id: 'contact', label: 'Contact', href: '#contact', icon: '📧', position: 5 }
      ]
    }
  });

  // Initialize managers once
  useEffect(() => {
    const scrollManager = ScrollManager.getInstance();
    const performanceManager = PerformanceManager.getInstance();

    performanceManager.startMark('app-init');

    return () => {
      scrollManager.destroy();
      performanceManager.destroy();
    };
  }, []);

  // Analytics tracking - stable callback
  useNavigationEvents('navigate', (event) => {
    console.log('Navigation event:', event);
  }, []); // Empty deps array

  return (
    <div className="app">
      <RadialMenu centerIcon="🎮" onNavigate={navActions.navigate} />

      <main className="app__main">
        <section id="home" className="app__section app__section--hero">
          <div className="app__container">
            <h1 className="app__hero-title">
              Welcome to Gaming<span className="app__brand">Dronzz</span>
            </h1>
            <p className="app__hero-subtitle">
              Professional Game Development Consultancy & Services
            </p>
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
          </div>
        </section>

        <section id="projects" className="app__section app__section--dark">
          <div className="app__container">
            <h2 className="app__section-title">Featured Projects</h2>
            <div className="app__projects-grid">
              <div className="app__project-card">
                <h3 className="app__project-title">Project Alpha</h3>
                <p className="app__project-description">
                  A next-generation mobile RPG with immersive storytelling.
                </p>
              </div>
              <div className="app__project-card">
                <h3 className="app__project-title">Project Beta</h3>
                <p className="app__project-description">
                  Cross-platform multiplayer strategy game with real-time combat.
                </p>
              </div>
              <div className="app__project-card">
                <h3 className="app__project-title">Project Gamma</h3>
                <p className="app__project-description">
                  VR experience pushing the boundaries of interactive entertainment.
                </p>
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
                  Complete game design from concept to final implementation.
                </p>
              </div>
              <div className="app__service-item">
                <div className="app__service-icon">⚙️</div>
                <h3 className="app__service-title">Development</h3>
                <p className="app__service-description">
                  Full-stack game development using cutting-edge technologies.
                </p>
              </div>
              <div className="app__service-item">
                <div className="app__service-icon">📊</div>
                <h3 className="app__service-title">Consulting</h3>
                <p className="app__service-description">
                  Strategic consulting to optimize your game development process.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="articles" className="app__section app__section--light">
          <div className="app__container">
            <h2 className="app__section-title">Latest Articles</h2>
            <div className="app__articles-grid">
              <article className="app__article-card">
                <h3 className="app__article-title">The Future of Mobile Gaming</h3>
                <p className="app__article-excerpt">
                  Exploring emerging trends and technologies shaping the mobile gaming landscape...
                </p>
                <time className="app__article-date">March 15, 2024</time>
              </article>
              <article className="app__article-card">
                <h3 className="app__article-title">Optimizing Game Performance</h3>
                <p className="app__article-excerpt">
                  Best practices for maintaining smooth gameplay across different devices...
                </p>
                <time className="app__article-date">March 10, 2024</time>
              </article>
            </div>
          </div>
        </section>

        <section id="contact" className="app__section app__section--contact">
          <div className="app__container">
            <h2 className="app__section-title">Get In Touch</h2>
            <p className="app__section-text">
              Ready to start your next gaming project? We'd love to hear from you.
            </p>
            <div className="app__contact-form">
              <button
                className="app__button app__button--primary app__button--large"
                onClick={() => window.location.href = 'mailto:hello@gamingdronzz.com'}
              >
                Start Your Project
              </button>
            </div>
          </div>
        </section>
      </main>

      {import.meta.env.DEV && (
        <div className="app__debug">
          <details>
            <summary>Navigation Debug</summary>
            <pre>{JSON.stringify(navState, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default App;