// components/ui/SkeletonLoader.tsx - Modern skeletal loading component with latest techniques
import React, { useEffect, useRef, useState } from 'react';
import './SkeletonLoader.css';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    animation?: 'pulse' | 'wave' | 'none';
    children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1.2em',
    borderRadius,
    className = '',
    variant = 'text',
    animation = 'wave',
    children
}) => {
    const skeletonRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (skeletonRef.current) {
            observer.observe(skeletonRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const getVariantStyles = () => {
        switch (variant) {
            case 'circular':
                return {
                    borderRadius: '50%',
                    width: height,
                };
            case 'rounded':
                return {
                    borderRadius: '8px',
                };
            case 'rectangular':
                return {
                    borderRadius: '0px',
                };
            case 'text':
            default:
                return {
                    borderRadius: borderRadius || '4px',
                };
        }
    };

    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...getVariantStyles(),
    };

    return (
        <div
            ref={skeletonRef}
            className={`
                skeleton 
                skeleton--${animation} 
                ${isVisible ? 'skeleton--visible' : ''} 
                ${className}
            `}
            style={style}
            role="presentation"
            aria-label="Loading content"
        >
            {children && (
                <div className="skeleton__content" style={{ opacity: 0 }}>
                    {children}
                </div>
            )}
        </div>
    );
};

interface ProjectSkeletonCardProps {
    index: number;
    delay?: number;
}

export const ProjectSkeletonCard: React.FC<ProjectSkeletonCardProps> = ({ 
    index, 
    delay = 0 
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay + (index * 150)); // Staggered animation
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, [index, delay]);

    return (
        <div
            ref={cardRef}
            className={`
                project-skeleton-card 
                ${isVisible ? 'project-skeleton-card--visible' : ''}
            `}
            style={{
                animationDelay: `${delay + (index * 150)}ms`
            }}
        >
            {/* Image skeleton */}
            <div className="project-skeleton-card__image">
                <Skeleton 
                    height={240} 
                    variant="rectangular" 
                    animation="wave"
                    className="project-skeleton-card__image-skeleton"
                />
                
                {/* Metadata overlays */}
                <div className="project-skeleton-card__metadata">
                    <Skeleton width={60} height={24} variant="rounded" />
                    <Skeleton width={80} height={24} variant="rounded" />
                </div>
            </div>

            {/* Content skeleton */}
            <div className="project-skeleton-card__content">
                {/* Header */}
                <div className="project-skeleton-card__header">
                    <Skeleton width="70%" height={28} variant="text" />
                    <Skeleton width={80} height={24} variant="rounded" />
                </div>

                {/* Description */}
                <div className="project-skeleton-card__description">
                    <Skeleton width="100%" height={16} variant="text" />
                    <Skeleton width="90%" height={16} variant="text" />
                    <Skeleton width="75%" height={16} variant="text" />
                </div>

                {/* Details grid */}
                <div className="project-skeleton-card__details">
                    <div className="project-skeleton-card__detail-row">
                        <Skeleton width={24} height={24} variant="circular" />
                        <Skeleton width={80} height={16} variant="text" />
                    </div>
                    <div className="project-skeleton-card__detail-row">
                        <Skeleton width={24} height={24} variant="circular" />
                        <Skeleton width={60} height={16} variant="text" />
                    </div>
                    <div className="project-skeleton-card__detail-row">
                        <Skeleton width={24} height={24} variant="circular" />
                        <Skeleton width={70} height={16} variant="text" />
                    </div>
                </div>

                {/* Tech tags */}
                <div className="project-skeleton-card__tech">
                    <Skeleton width={50} height={24} variant="rounded" />
                    <Skeleton width={65} height={24} variant="rounded" />
                    <Skeleton width={45} height={24} variant="rounded" />
                    <Skeleton width={70} height={24} variant="rounded" />
                </div>

                {/* Meta footer */}
                <div className="project-skeleton-card__meta">
                    <div className="project-skeleton-card__meta-left">
                        <Skeleton width={24} height={16} variant="circular" />
                        <Skeleton width={60} height={16} variant="text" />
                    </div>
                    <div className="project-skeleton-card__meta-right">
                        <Skeleton width={24} height={16} variant="circular" />
                        <Skeleton width={40} height={16} variant="text" />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ProjectSkeletonGridProps {
    count?: number;
    className?: string;
}

export const ProjectSkeletonGrid: React.FC<ProjectSkeletonGridProps> = ({ 
    count = 4,
    className = '' 
}) => {
    return (
        <div className={`project-skeleton-grid ${className}`}>
            {Array.from({ length: count }, (_, index) => (
                <ProjectSkeletonCard key={`skeleton-${index}`} index={index} />
            ))}
        </div>
    );
};

interface SmartSkeletonLoaderProps {
    isLoading: boolean;
    hasData: boolean;
    children: React.ReactNode;
    skeletonCount?: number;
    className?: string;
    fadeTransition?: boolean;
}

export const SmartSkeletonLoader: React.FC<SmartSkeletonLoaderProps> = ({
    isLoading,
    hasData,
    children,
    skeletonCount = 4,
    className = '',
    fadeTransition = true
}) => {
    const [showSkeleton, setShowSkeleton] = useState(isLoading);
    const [showContent, setShowContent] = useState(!isLoading && hasData);

    useEffect(() => {
        if (isLoading) {
            setShowContent(false);
            // Small delay to show skeleton for minimum time
            setTimeout(() => setShowSkeleton(true), 50);
        } else if (hasData) {
            setShowSkeleton(false);
            // Fade in content after skeleton fades out
            setTimeout(() => setShowContent(true), fadeTransition ? 300 : 0);
        } else {
            setShowSkeleton(false);
            setShowContent(false);
        }
    }, [isLoading, hasData, fadeTransition]);

    return (
        <div className={`smart-skeleton-loader ${className}`}>
            {showSkeleton && (
                <div 
                    className={`
                        smart-skeleton-loader__skeleton 
                        ${!isLoading ? 'smart-skeleton-loader__skeleton--fade-out' : ''}
                    `}
                >
                    <ProjectSkeletonGrid count={skeletonCount} />
                </div>
            )}
            
            {showContent && (
                <div 
                    className={`
                        smart-skeleton-loader__content
                        ${fadeTransition ? 'smart-skeleton-loader__content--fade-in' : ''}
                    `}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default Skeleton;