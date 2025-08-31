import React, { useEffect, useRef, useState } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { useLazyLoad } from '../../hooks/useLazyLoad';
import ArticleService, { ArticleData } from '../../services/ArticleService';
import './Articles.css';


interface ArticlesProps {
    showFeaturedOnly?: boolean;
    maxArticles?: number;
    customData?: ArticleData[];
}


const Articles: React.FC<ArticlesProps> = ({
    showFeaturedOnly = false,
    maxArticles,
    customData
}) => {
    const articlesRef = useRef<HTMLElement>(null);
    const { setCurrentSection } = useContentManager();
    const { observeImage } = useLazyLoad();
    const [filter, setFilter] = useState<'all' | string>('all');
    const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
    const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
    const [articles, setArticles] = useState<ArticleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load articles from backend
    useEffect(() => {
        const loadArticles = async () => {
            if (customData) {
                setArticles(customData);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                let fetchedArticles: ArticleData[];
                
                if (showFeaturedOnly) {
                    fetchedArticles = await ArticleService.getFeaturedArticles();
                } else {
                    fetchedArticles = await ArticleService.getLatestArticles(maxArticles || 10);
                }
                
                setArticles(fetchedArticles);
            } catch (err) {
                console.error('Failed to load articles:', err);
                setError('Failed to load articles. Please try again later.');
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };

        loadArticles();
    }, [showFeaturedOnly, maxArticles, customData]);

    const filteredArticles = filter === 'all'
        ? articles
        : articles.filter(a => a.category.toLowerCase() === filter.toLowerCase());

    const featuredArticles = showFeaturedOnly
        ? filteredArticles.filter(a => a.featured)
        : filteredArticles;

    const displayArticles = maxArticles
        ? featuredArticles.slice(0, maxArticles)
        : featuredArticles;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCurrentSection('articles');
                    // Add entrance animation class
                    entry.target.classList.add('articles--visible');
                }
            },
            { threshold: 0.1 }
        );

        if (articlesRef.current) {
            observer.observe(articlesRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection]);

    // Individual card animation observer
    useEffect(() => {
        const cardObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const cardId = entry.target.getAttribute('data-article-id');
                        if (cardId) {
                            setVisibleCards(prev => new Set([...prev, cardId]));
                        }
                    }
                });
            },
            { threshold: 0.2, rootMargin: '50px' }
        );

        const cards = document.querySelectorAll('.articles__item');
        cards.forEach(card => cardObserver.observe(card));

        return () => cardObserver.disconnect();
    }, [displayArticles, viewMode]);

    const categories = ['all', ...Array.from(new Set(articles.map(a => a.category)))];

    return (
        <section
            ref={articlesRef}
            id="articles"
            className="articles"
            aria-label="Articles section"
        >
            <div className="articles__container">
                {/* Enhanced Header */}
                <div className="articles__header">
                    <div className="articles__header-content">
                        <h2 className="articles__title">
                            <span className="articles__title-accent">Latest</span> Articles
                        </h2>
                        <p className="articles__subtitle">
                            Insights, tips, and trends from the world of game development
                        </p>
                    </div>

                    {!showFeaturedOnly && (
                        <div className="articles__controls">
                            <div className="articles__view-toggle">
                                <button
                                    className={`articles__view-btn ${viewMode === 'timeline' ? 'articles__view-btn--active' : ''}`}
                                    onClick={() => setViewMode('timeline')}
                                    aria-label="Timeline view"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M2 3h12a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2zm0 4h12a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2zm0 4h12a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2z" />
                                    </svg>
                                    Timeline
                                </button>
                                <button
                                    className={`articles__view-btn ${viewMode === 'grid' ? 'articles__view-btn--active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    aria-label="Grid view"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7z" />
                                    </svg>
                                    Grid
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                {!showFeaturedOnly && (
                    <div className="articles__filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`articles__filter ${filter === category ? 'articles__filter--active' : ''}`}
                                onClick={() => setFilter(category)}
                            >
                                {category === 'all' ? 'All Articles' : category}
                            </button>
                        ))}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="articles__loading">
                        <div className="articles__loading-spinner"></div>
                        <p>Loading articles...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="articles__error">
                        <div className="articles__error-icon">⚠️</div>
                        <h3>Unable to Load Articles</h3>
                        <p>{error}</p>
                        <button 
                            className="articles__retry-btn"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && displayArticles.length === 0 && (
                    <div className="articles__empty">
                        <div className="articles__empty-icon">📄</div>
                        <h3>No Articles Available</h3>
                        <p>Check back later for new content!</p>
                    </div>
                )}

                {/* Articles Container */}
                {!loading && !error && displayArticles.length > 0 && (
                    <div className={`articles__content articles__content--${viewMode}`}>
                        {viewMode === 'timeline' ? (
                            <div className="articles__timeline">
                                <div className="articles__timeline-line"></div>
                                {displayArticles.map((article, index) => (
                                    <ArticleTimelineItem
                                        key={article.id}
                                        article={article}
                                        index={index}
                                        isVisible={visibleCards.has(article.id)}
                                        observeImage={observeImage}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="articles__grid">
                                {displayArticles.map((article, index) => (
                                    <ArticleGridItem
                                        key={article.id}
                                        article={article}
                                        index={index}
                                        isVisible={visibleCards.has(article.id)}
                                        observeImage={observeImage}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CTA */}
                {!showFeaturedOnly && (
                    <div className="articles__cta">
                        <button className="articles__view-all">
                            <span>Explore All Articles</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.5 7.5-3-3a.5.5 0 0 0-.708.708L10.293 7.5H4.5a.5.5 0 0 0 0 1h5.793l-2.5 2.5a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

// Timeline Item Component
interface ArticleTimelineItemProps {
    article: ArticleData;
    index: number;
    isVisible: boolean;
    observeImage: (img: HTMLImageElement) => void;
}

const ArticleTimelineItem: React.FC<ArticleTimelineItemProps> = ({
    article,
    index,
    isVisible,
    observeImage
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const isEven = index % 2 === 0;

    useEffect(() => {
        if (imgRef.current && article.image) {
            observeImage(imgRef.current);
        }
    }, [observeImage, article.image]);

    const handleReadMore = (): void => {
        console.log('Reading article:', article.id);
    };

    return (
        <article
            className={`articles__item articles__timeline-item ${isEven ? 'articles__timeline-item--left' : 'articles__timeline-item--right'} ${article.featured ? 'articles__timeline-item--featured' : ''} ${isVisible ? 'articles__item--visible' : ''}`}
            data-article-id={article.id}
        >
            <div className="articles__timeline-marker">
                <div className="articles__timeline-dot"></div>
            </div>

            <div className="articles__timeline-content">
                <div className="articles__timeline-card">
                    <div className="articles__timeline-header">
                        <div className="articles__meta-badges">
                            <span className="articles__category-badge">{article.category}</span>
                            {article.featured && <span className="articles__featured-badge">Featured</span>}
                        </div>
                        <div className="articles__meta-info">
                            <time className="articles__date">{article.publishDate}</time>
                            <span className="articles__read-time">{article.readTime}</span>
                        </div>
                    </div>

                    <div className="articles__timeline-body">
                        <h3 className="articles__item-title">{article.title}</h3>
                        <p className="articles__item-excerpt">{article.excerpt}</p>

                        <div className="articles__tags-compact">
                            {article.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span key={tagIndex} className="articles__tag-compact">
                                    {tag}
                                </span>
                            ))}
                            {article.tags.length > 3 && (
                                <span className="articles__tag-more">+{article.tags.length - 3}</span>
                            )}
                        </div>
                    </div>

                    <div className="articles__timeline-footer">
                        <div className="articles__author-info">
                            <span className="articles__author">By {article.author}</span>
                        </div>
                        <button
                            className="articles__read-btn"
                            onClick={handleReadMore}
                            aria-label={`Read ${article.title}`}
                        >
                            Read Article
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                <path d="M6 0L4.6 1.4L8.2 5H0v2h8.2L4.6 10.6L6 12L12 6z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

// Grid Item Component (Compact Modern Cards)
interface ArticleGridItemProps {
    article: ArticleData;
    index: number;
    isVisible: boolean;
    observeImage: (img: HTMLImageElement) => void;
}

const ArticleGridItem: React.FC<ArticleGridItemProps> = ({
    article,
    index,
    isVisible,
    observeImage
}) => {
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (imgRef.current && article.image) {
            observeImage(imgRef.current);
        }
    }, [observeImage, article.image]);

    const handleReadMore = (): void => {
        console.log('Reading article:', article.id);
    };

    return (
        <article
            className={`articles__item articles__grid-item ${article.featured ? 'articles__grid-item--featured' : ''} ${isVisible ? 'articles__item--visible' : ''}`}
            data-article-id={article.id}
            style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
        >
            <div className="articles__grid-card">
                <div className="articles__grid-header">
                    <div className="articles__meta-badges">
                        <span className="articles__category-badge">{article.category}</span>
                        {article.featured && <span className="articles__featured-badge">Featured</span>}
                    </div>
                    <span className="articles__read-time">{article.readTime}</span>
                </div>

                <div className="articles__grid-body">
                    <h3 className="articles__item-title">{article.title}</h3>
                    <p className="articles__item-excerpt">{article.excerpt}</p>
                </div>

                <div className="articles__grid-footer">
                    <div className="articles__meta-bottom">
                        <span className="articles__author">By {article.author}</span>
                        <time className="articles__date">{article.publishDate}</time>
                    </div>

                    <div className="articles__tags-compact">
                        {article.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span key={tagIndex} className="articles__tag-compact">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <button
                        className="articles__read-btn articles__read-btn--grid"
                        onClick={handleReadMore}
                        aria-label={`Read ${article.title}`}
                    >
                        Read More
                    </button>
                </div>
            </div>
        </article>
    );
};

export default Articles;