import { useEffect, useState, useMemo } from 'react';
import './Preloader.css';

interface PreloaderProps {
    onComplete?: () => void;
    duration?: number;
    minDisplayTime?: number;
    className?: string;
}

const Preloader: React.FC<PreloaderProps> = ({
    onComplete,
    duration = 2000,
    minDisplayTime = 1000,
    className = ''
}) => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const startTime = Date.now();
        let animationFrame: number;

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);

            setProgress(newProgress);

            if (newProgress < 100) {
                animationFrame = requestAnimationFrame(updateProgress);
            } else {
                // Ensure minimum display time
                const totalElapsed = Date.now() - startTime;
                const remainingTime = Math.max(0, minDisplayTime - totalElapsed);

                setTimeout(() => {
                    setIsExiting(true);
                    setTimeout(() => {
                        setIsVisible(false);
                        onComplete?.();
                    }, 500); // Exit animation duration
                }, remainingTime);
            }
        };

        animationFrame = requestAnimationFrame(updateProgress);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [duration, minDisplayTime, onComplete]);

    const progressClasses = useMemo(() => [
        'preloader',
        isExiting && 'preloader--exiting',
        className
    ].filter(Boolean).join(' '), [isExiting, className]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={progressClasses}>
            <div className="preloader__content">
                <div className="preloader__text">
                    <span className="preloader__bracket-open">{'{'}</span>
                    <span className="preloader__label">LOADING</span>
                    <span className="preloader__bracket-close">{'}'}</span>
                </div>
                <div className="preloader__percentage">
                    {Math.round(progress)}%
                </div>
            </div>
            <div className="preloader__progress-bar">
                <div
                    className="preloader__progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Preloader;