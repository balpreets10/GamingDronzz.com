import { useEffect, useState } from 'react';
import ModernNavigation from './components/navigation/ModernNavigation';
import Preloader from './components/ui/Preloader';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Services from './components/sections/Services';
import Articles from './components/sections/Articles';
import Contact from './components/sections/Contact';
import useNavigation, { useNavigationEvents } from './hooks/useNavigation';
import { useAuth } from './hooks/useAuth';
import ScrollManager from './managers/ScrollManager';
import PerformanceManager from './managers/PerformanceManager';
import { initializeThemeSystem, type Theme } from './managers/ThemeManager';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [preloaderCompleted, setPreloaderCompleted] = useState(false);

  const { loading: authLoading } = useAuth();
  const { state: navState, actions: navActions } = useNavigation({
    customConfig: {
      items: [
        { id: 'hero', label: 'Home', href: '#hero', position: 0 },
        { id: 'about', label: 'About', href: '#about', position: 1 },
        { id: 'projects', label: 'Projects', href: '#projects', position: 2 },
        { id: 'services', label: 'Services', href: '#services', position: 3 },
        { id: 'articles', label: 'Articles', href: '#articles', position: 4 },
        { id: 'contact', label: 'Contact', href: '#contact', position: 5 }
      ]
    }
  });

  // Initialize managers and theme system once
  useEffect(() => {
    const scrollManager = ScrollManager.getInstance();
    const performanceManager = PerformanceManager.getInstance();

    performanceManager.startMark('app-init');

    // Initialize optimized theme system - picks theme and applies immediately
    const selectedTheme = initializeThemeSystem({
      enableSessionConsistency: false, // Load new theme on every reload
      enableLogging: import.meta.env.DEV
    });
    setCurrentTheme(selectedTheme);

    // Add smooth theme transition class to body
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
    setPreloaderCompleted(true);
  };

  // Handle transition to main app only when both preloader is done AND auth is ready
  useEffect(() => {
    if (preloaderCompleted && !authLoading) {
      setIsLoading(false);
      document.body.classList.add('app-loaded');
    }
  }, [preloaderCompleted, authLoading]);

  const handleNavigate = (sectionId: string) => {
    navActions.navigate(sectionId);
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
      {/* Modern Navigation */}
      <ModernNavigation
        position="fixed-top"
        onNavigate={handleNavigate}
      />

      <main className="app__main">
        {/* Hero Section - Fixed props to match HeroProps interface */}
        <Hero
          title="Welcome to Gaming Dronzz"
          subtitle="Professional Game Development Consultancy & Services"
          primaryCtaText="Get Started"
          onPrimaryCtaClick={() => handleNavigate('contact')}
        />

        {/* About Section */}
        <About />

        {/* Projects Section */}
        <Projects
          showFeaturedOnly={false}
          maxProjects={6}
        />

        {/* Services Section */}
        <Services
          showFeaturedOnly={false}
          maxServices={6}
        />

        {/* Articles Section */}
        <Articles
          showFeaturedOnly={false}
          maxArticles={3}
        />

        {/* Contact Section */}
        <Contact
          showForm={true}
        />
      </main>

      {/* Footer */}
      <footer className="app__footer">
        <div className="app__container">
          <div className="app__footer-content">
            <div className="app__footer-brand">
              <h3>GamingDronzz</h3>
              <p>Crafting exceptional gaming experiences</p>
              {currentTheme && (
                <div className="app__theme-indicator">
                  <span className="app__theme-emoji">{currentTheme.icon}</span>
                  <span className="app__theme-name">
                    Today's Theme: {currentTheme.name}
                  </span>
                </div>
              )}
            </div>
            <div className="app__footer-links">
              <div className="app__footer-section">
                <h4>Services</h4>
                <ul>
                  <li><a href="#services" onClick={() => handleNavigate('services')}>Game Design</a></li>
                  <li><a href="#services" onClick={() => handleNavigate('services')}>Development</a></li>
                  <li><a href="#services" onClick={() => handleNavigate('services')}>Consulting</a></li>
                </ul>
              </div>
              <div className="app__footer-section">
                <h4>Company</h4>
                <ul>
                  <li><a href="#about" onClick={() => handleNavigate('about')}>About</a></li>
                  <li><a href="#projects" onClick={() => handleNavigate('projects')}>Projects</a></li>
                  <li><a href="#articles" onClick={() => handleNavigate('articles')}>Blog</a></li>
                </ul>
              </div>
              <div className="app__footer-section">
                <h4>Connect</h4>
                <ul>
                  <li><a href="#contact" onClick={() => handleNavigate('contact')}>Contact</a></li>
                  <li><a href="mailto:hello@gamingdronzz.com">Email</a></li>
                  <li><a href="tel:+15551234567">Phone</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="app__footer-bottom">
            <p>&copy; 2025 GamingDronzz. All rights reserved.</p>
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