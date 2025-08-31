// components/router/AppRouter.tsx - Main application router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../../App';
import OAuthCallback from '../auth/OAuthCallback';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/*" element={<App />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;