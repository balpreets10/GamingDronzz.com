import React, { useEffect, useRef, useState } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { useLazyLoad } from '../../hooks/useLazyLoad';
import './Articles.css';

interface ArticleData {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    publishDate: string;
    readTime: string;
    image?: string;
    tags: string[];
    featured: boolean;
}

interface ArticlesProps {
    showFeaturedOnly?: boolean;
    maxArticles?: number;
    customData?: ArticleData[];
}

// Enhanced fallback data with better variety
const defaultArticlesData: ArticleData[] = [
    {
        id: '1',
        title: 'The Future of Mobile Gaming: AR Integration & Cloud Solutions',
        excerpt: 'Exploring emerging trends and technologies shaping the mobile gaming landscape, from AR integration to cloud gaming solutions that are revolutionizing how we play...',
        category: 'Mobile Gaming',
        author: 'Alex Chen',
        publishDate: 'March 15, 2024',
        readTime: '5 min',
        tags: ['mobile', 'AR', 'cloud', 'trends'],
        featured: true
    },
    {
        id: '2',
        title: 'Optimizing Game Performance Across Multiple Platforms',
        excerpt: 'Best practices for maintaining smooth gameplay across different devices, covering memory management, rendering optimization, and platform-specific considerations...',
        category: 'Performance',
        author: 'Sarah Martinez',
        publishDate: 'March 12, 2024',
        readTime: '8 min',
        tags: ['performance', 'optimization', 'unity', 'mobile'],
        featured: false
    },
    {
        id: '3',
        title: 'Game Development Trends 2024: AI-Assisted Design',
        excerpt: 'A comprehensive look at the latest trends in game development, from AI-assisted design tools to sustainable development practices that are changing the industry...',
        category: 'Industry',
        author: 'Mike Johnson',
        publishDate: 'March 10, 2024',
        readTime: '6 min',
        tags: ['AI', 'trends', 'industry', 'design'],
        featured: true
    },
    {
        id: '4',
        title: 'Building Scalable Multiplayer Architecture',
        excerpt: 'Deep dive into creating robust multiplayer systems that can handle thousands of concurrent players while maintaining low latency and high reliability...',
        category: 'Backend',
        author: 'Emily Davis',
        publishDate: 'March 8, 2024',
        readTime: '12 min',
        tags: ['multiplayer', 'backend', 'scalability', 'architecture'],
        featured: false
    },
    {
        id: '5',
        title: 'Monetization Strategies for Indie Games',
        excerpt: 'Proven strategies for indie game developers to effectively monetize their games without compromising player experience or game quality...',
        category: 'Business',
        author: 'David Kim',
        publishDate: 'March 5, 2024',
        readTime: '7 min',
        tags: ['monetization', 'indie', 'business', 'strategy'],
        featured: false
    }
];

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

    const articles = customData || defaultArticlesData;

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

                {/* Articles Container */}
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