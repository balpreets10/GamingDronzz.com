import React, { useEffect, useRef, useState } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import './Apps.css';

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: 'live' | 'beta' | 'coming-soon';
  link?: string;
  downloadLink?: string;
}

interface AppsProps {
  maxApps?: number;
  showFeaturedOnly?: boolean;
}

const Apps: React.FC<AppsProps> = ({ maxApps, showFeaturedOnly = false }) => {
  const appsRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const contentManager = useContentManager();
  const setCurrentSection = contentManager?.setCurrentSection;

  // Fetch apps from backend
  useEffect(() => {
    const fetchApps = async () => {
      setIsLoading(true);
      try {
        // TODO: Implement backend API call to fetch apps
        // const response = await supabase.from('apps').select('*');
        // const appsData = response.data || [];

        // For now, set empty array since no backend apps exist yet
        const appsData: App[] = [];

        const filteredApps = showFeaturedOnly
          ? appsData.filter(app => app.status === 'live')
          : appsData;

        const limitedApps = maxApps
          ? filteredApps.slice(0, maxApps)
          : filteredApps;

        setApps(limitedApps);
      } catch (error) {
        console.error('Failed to fetch apps:', error);
        setApps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, [maxApps, showFeaturedOnly]);

  // Intersection observer for animations
  useEffect(() => {
    if (!appsRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (setCurrentSection) {
            setCurrentSection('apps');
          }
          setIsVisible(true);

          setTimeout(() => {
            if (appsRef.current) {
              appsRef.current.classList.add('apps--animate-in');
            }
          }, 100);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(appsRef.current);

    return () => {
      observer.disconnect();
    };
  }, [setCurrentSection]);

  const getStatusBadge = (status: App['status']) => {
    const statusConfig = {
      live: { text: 'Live', className: 'apps__status--live' },
      beta: { text: 'Beta', className: 'apps__status--beta' },
      'coming-soon': { text: 'Coming Soon', className: 'apps__status--coming-soon' }
    };

    const config = statusConfig[status];
    return (
      <span className={`apps__status ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const handleAppClick = (app: App) => {
    if (app.status === 'coming-soon') return;

    if (app.link) {
      // In a real app, this would navigate to the app page
      console.log(`Opening app: ${app.name}`);
    }
  };

  if (isLoading) {
    return (
      <section className="apps apps--loading" aria-label="Apps section - Loading">
        <div className="apps__container">
          <div className="apps__loading">
            <div className="apps__spinner"></div>
            <p>Loading applications...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={appsRef}
      id="apps"
      className="apps"
      aria-label="Our Applications"
    >
      <div className="apps__container">
        <header className="apps__header">
          <h2 className="apps__heading">Our Apps</h2>
          <p className="apps__subheading">
            Powerful tools and applications designed for gamers and developers
          </p>
        </header>

        <div className="apps__grid" role="grid" aria-label="Available applications">
          {apps.map((app, index) => (
            <div
              key={app.id}
              className={`apps__card ${app.status === 'coming-soon' ? 'apps__card--disabled' : ''}`}
              role="gridcell"
              tabIndex={app.status !== 'coming-soon' ? 0 : -1}
              onClick={() => handleAppClick(app)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAppClick(app);
                }
              }}
              style={{
                animationDelay: isVisible ? `${index * 150}ms` : '0ms'
              }}
            >
              <div className="apps__card-content">
                <div className="apps__card-header">
                  <div className="apps__card-icon" aria-hidden="true">
                    {app.icon}
                  </div>
                  <div className="apps__card-meta">
                    <h3 className="apps__card-title">{app.name}</h3>
                    <span className="apps__card-category">{app.category}</span>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <p className="apps__card-description">{app.description}</p>

                <div className="apps__card-actions">
                  {app.status === 'live' && (
                    <>
                      <button className="apps__card-button apps__card-button--primary">
                        Open App
                      </button>
                      {app.downloadLink && (
                        <button className="apps__card-button apps__card-button--secondary">
                          Download
                        </button>
                      )}
                    </>
                  )}
                  {app.status === 'beta' && (
                    <>
                      <button className="apps__card-button apps__card-button--beta">
                        Try Beta
                      </button>
                      {app.downloadLink && (
                        <button className="apps__card-button apps__card-button--secondary">
                          Download
                        </button>
                      )}
                    </>
                  )}
                  {app.status === 'coming-soon' && (
                    <button className="apps__card-button apps__card-button--disabled" disabled>
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>

              <div className="apps__card-glow" aria-hidden="true"></div>
            </div>
          ))}
        </div>

        {apps.length === 0 && !isLoading && (
          <div className="apps__empty">
            <div className="apps__empty-icon">📱</div>
            <h3>No Apps Available</h3>
            <p>Apps will be loaded from the backend once they are added to the database.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Apps;