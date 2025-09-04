// components/router/AppRouter.tsx - Main application router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../../App';
import OAuthCallback from '../auth/OAuthCallback';
import Terraceon3 from '../../pages/Terraceon3/Terraceon3';
import SoulFit from '../../pages/SoulFit/SoulFit';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/terraceon3" element={<Terraceon3 />} />
                <Route path="/soulfit" element={<SoulFit />} />
                <Route path="/*" element={<App />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;