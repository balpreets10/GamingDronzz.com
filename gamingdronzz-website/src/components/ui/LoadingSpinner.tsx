interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }: LoadingSpinnerProps) => (
    <div className={`loading-spinner loading-spinner--${size}`}>
        <div className="loading-spinner__circle"></div>
        {message && <p className="loading-spinner__message">{message}</p>}
    </div>
);


export { LoadingSpinner };