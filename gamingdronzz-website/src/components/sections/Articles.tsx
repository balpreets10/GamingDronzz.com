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

// Fallback data - replace with actual data import when available
const defaultArticlesData: ArticleData[] = [
    {
        id: '1',
        title: 'The Future of Mobile Gaming',
        excerpt: 'Exploring emerging trends and technologies shaping the mobile gaming landscape, from AR integration to cloud gaming solutions...',
        category: 'Mobile Gaming',
        author: 'Gaming Team',
        publishDate: 'March 15, 2024',
        readTime: '5 min read',
        tags: ['mobile', 'trends', 'ar', 'cloud'],
        featured: true
    },
    {
        id: '2',
        title: 'Optimizing Game Performance',
        excerpt: 'Best practices for maintaining smooth gameplay across different devices, covering memory management, rendering optimization, and more...',
        category: 'Performance',
        author: 'Tech Team',
        publishDate: 'March 10, 2024',
        readTime: '8 min read',
        tags: ['performance', 'optimization', 'unity'],
        featured: false
    },
    {
        id: '3',
        title: 'Game Development Trends 2024',
        excerpt: 'A comprehensive look at the latest trends in game development, from AI-assisted design to sustainable development practices...',
        category: 'Industry',
        author: 'Strategy Team',
        publishDate: 'March 5, 2024',
        readTime: '6 min read',
        tags: ['trends', 'ai', 'industry', 'development'],
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
                }
            },
            { threshold: 0.3 }
        );

        if (articlesRef.current) {
            observer.observe(articlesRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection]);

    const categories = ['all', ...Array.from(new Set(articles.map(a => a.category)))];

    return (
        <section
            ref={articlesRef}
            id="articles"
            className="articles"
            aria-label="Articles section"
        >
            <div className="articles__container">
                <div className="articles__header">
                    <h2 className="articles__title">Latest Articles</h2>
                    <p className="articles__subtitle">
                        Insights, tips, and trends from the world of game development
                    </p>
                </div>

                {!showFeaturedOnly && (
                    <div className="articles__filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`articles__filter ${filter === category ? 'articles__filter--active' : ''}`}
                                onClick={() => setFilter(category)}
                            >
                                {category === 'all' ? 'All' : category}
                            </button>
                        ))}
                    </div>
                )}

                <div className="articles__grid">
                    {displayArticles.map((article) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            observeImage={observeImage}
                        />
                    ))}
                </div>

                {!showFeaturedOnly && (
                    <div className="articles__cta">
                        <button className="articles__view-all">
                            View All Articles
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

interface ArticleCardProps {
    article: ArticleData;
    observeImage: (img: HTMLImageElement) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, observeImage }) => {
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (imgRef.current && article.image) {
            observeImage(imgRef.current);
        }
    }, [observeImage, article.image]);

    const handleReadMore = (): void => {
        // Implement article reading logic
        console.log('Reading article:', article.id);
    };

    return (
        <article className={`articles__card ${article.featured ? 'articles__card--featured' : ''}`}>
            {article.image && (
                <div className="articles__card-image">
                    <img
                        ref={imgRef}
                        data-src={article.image}
                        alt={article.title}
                        loading="lazy"
                    />
                </div>
            )}

            <div className="articles__card-content">
                <div className="articles__card-category">{article.category}</div>

                <h3 className="articles__card-title">{article.title}</h3>

                <p className="articles__card-excerpt">{article.excerpt}</p>

                <div className="articles__card-tags">
                    {article.tags.map((tag, index) => (
                        <span key={index} className="articles__tag">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="articles__card-meta">
                    <div className="articles__meta-left">
                        <span className="articles__author">{article.author}</span>
                        <time className="articles__date">{article.publishDate}</time>
                    </div>
                    <span className="articles__read-time">{article.readTime}</span>
                </div>

                <button
                    className="articles__read-more"
                    onClick={handleReadMore}
                    aria-label={`Read more about ${article.title}`}
                >
                    Read More
                </button>
            </div>
        </article>
    );
};

export default Articles;