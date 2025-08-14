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
    duration = 1200, // Reduced from 2000ms
    minDisplayTime = 800, // Reduced from 1500ms
    className = ''
}) => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<'loading' | 'complete' | 'exiting'>('loading');

    // Predefined loading messages for more engaging experience
    const loadingMessages = [
        'Initializing Game Engine...',
        'Loading Assets...',
        'Optimizing Performance...',
        'Preparing Experience...',
        'Almost Ready...'
    ];

    const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const startTime = Date.now();
        let animationFrame: number;
        let messageIndex = 0;

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);

            setProgress(newProgress);

            // Update loading message based on progress
            const expectedMessageIndex = Math.floor((newProgress / 100) * (loadingMessages.length - 1));
            if (expectedMessageIndex !== messageIndex && expectedMessageIndex < loadingMessages.length) {
                messageIndex = expectedMessageIndex;
                setCurrentMessage(loadingMessages[messageIndex]);
            }

            if (newProgress < 100) {
                animationFrame = requestAnimationFrame(updateProgress);
            } else {
                setCurrentPhase('complete');
                setCurrentMessage('Ready to Launch!');

                // Ensure minimum display time
                const totalElapsed = Date.now() - startTime;
                const remainingTime = Math.max(0, minDisplayTime - totalElapsed);

                setTimeout(() => {
                    setCurrentPhase('exiting');
                    setIsExiting(true);
                    setTimeout(() => {
                        setIsVisible(false);
                        onComplete?.();
                    }, 400); // Reduced exit animation duration
                }, remainingTime);
            }
        };

        // Add a small delay before starting for smooth appearance
        setTimeout(() => {
            animationFrame = requestAnimationFrame(updateProgress);
        }, 100);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [duration, minDisplayTime, onComplete, loadingMessages]);

    const progressClasses = useMemo(() => [
        'preloader',
        `preloader--${currentPhase}`,
        isExiting && 'preloader--exiting',
        className
    ].filter(Boolean).join(' '), [currentPhase, isExiting, className]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={progressClasses}>
            {/* Animated Background Elements */}
            <div className="preloader__bg-animation">
                <div className="preloader__particle preloader__particle--1"></div>
                <div className="preloader__particle preloader__particle--2"></div>
                <div className="preloader__particle preloader__particle--3"></div>
                <div className="preloader__particle preloader__particle--4"></div>
            </div>

            <div className="preloader__content">
                {/* Brand Logo/Text */}
                <div className="preloader__brand">
                    <div className="preloader__logo">
                        <span className="preloader__bracket-open">{'{'}</span>
                        <span className="preloader__brand-text">
                            Gaming<span className="preloader__brand-accent">Dronzz</span>
                        </span>
                        <span className="preloader__bracket-close">{'}'}</span>
                    </div>
                </div>

                {/* Loading Message */}
                <div className="preloader__message">
                    {currentMessage}
                </div>

                {/* Progress Section */}
                <div className="preloader__progress-section">
                    <div className="preloader__percentage">
                        {Math.round(progress)}%
                    </div>

                    <div className="preloader__progress-container">
                        <div className="preloader__progress-track">
                            <div
                                className="preloader__progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                            <div className="preloader__progress-glow" />
                        </div>
                    </div>
                </div>

                {/* Loading Dots Animation */}
                <div className="preloader__dots">
                    <span className="preloader__dot"></span>
                    <span className="preloader__dot"></span>
                    <span className="preloader__dot"></span>
                </div>
            </div>

            {/* Success Checkmark for Complete Phase */}
            {currentPhase === 'complete' && (
                <div className="preloader__success">
                    <div className="preloader__checkmark">
                        <svg viewBox="0 0 24 24" className="preloader__checkmark-icon">
                            <path
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Preloader;