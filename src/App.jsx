import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketProvider } from './context/SocketContext';
import { useStore } from './context/StoreContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReporterView from './pages/ReporterView';
import ResponderView from './pages/ResponderView';
import AnalyticsPage from './pages/AnalyticsPage';

const PAGES = {
  home: Home,
  login: Login,
  command: Dashboard,
  report: ReporterView,
  responder: ResponderView,
  analytics: AnalyticsPage,
};

const VALID_KEYS = new Set(Object.keys(PAGES));

function readRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  return VALID_KEYS.has(hash) ? hash : 'home';
}

function BootScan() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="pointer-events-none fixed inset-0 z-[2000]"
      style={{ background: 'linear-gradient(180deg, transparent, rgba(28, 79, 166,0.05), transparent)' }}
    >
      <motion.div
        initial={{ y: '-10%' }}
        animate={{ y: '110%' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="h-24 w-full"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(28, 79, 166,0.12), transparent)' }}
      />
    </motion.div>
  );
}

export default function App() {
  const [route, setRoute] = useState(readRoute());
  const { currentUser } = useStore();

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (key) => {
    if (!VALID_KEYS.has(key)) return;
    setRoute(key);
    if (window.location.hash.replace('#', '') !== key) {
      window.location.hash = key;
    }
  };

  // Redirect based on authentication and RBAC
  useEffect(() => {
    if (!currentUser && route !== 'home' && route !== 'login') {
      navigate('login');
      return;
    }
    if (currentUser) {
      if (currentUser.role === 'citizen' && !['home', 'report'].includes(route)) {
        navigate('report');
      } else if (currentUser.role === 'responder' && !['responder'].includes(route)) {
        navigate('responder');
      } else if (currentUser.role === 'commander' && !['command', 'analytics'].includes(route)) {
        navigate('command');
      }
    }
  }, [route, currentUser]);

  const ActivePage = (!currentUser && route !== 'home' && route !== 'login') ? Login : (PAGES[route] ?? Home);

  const getThemeClass = (route) => {
    return 'theme-home'; // Apply Spider-Sense cream/red theme to entire app
  };

  useEffect(() => {
    document.body.className = getThemeClass(route);
  }, [route]);

  const getBackgroundImage = () => {
    switch (route) {
      case 'command': return 'https://images.unsplash.com/photo-1620023602930-b3b3a32f6db4?auto=format&fit=crop&w=2000&q=80'; // Stark vibe
      case 'report': return 'https://images.wallpapersden.com/image/download/captain-america-iron-man-thor-avengers_a2lramiUmZqaraWkpJRmbmdlrWZlbWU.jpg'; // Cap/Iron/Thor
      case 'responder': return 'https://wallpapercave.com/wp/wp3718001.jpg'; // Action Avengers
      case 'login': return 'https://images.unsplash.com/photo-1608889175250-c3b0c1667d3a?auto=format&fit=crop&w=2000&q=80'; // Avengers lineup
      default: return 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=2000&q=80'; // Spider-Man
    }
  };

  return (
    <SocketProvider>
      <div className="min-h-screen transition-colors duration-500 relative text-[var(--ink)]">
        
        {/* GLOBAL CINEMATIC BACKGROUND */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.15] sm:opacity-[0.25]" style={{ zIndex: 0 }}>
          <img 
            key={getBackgroundImage()} // force re-render on change
            src={getBackgroundImage()} 
            alt="Cinematic Background" 
            className="w-full h-full object-cover object-center grayscale-[30%] transition-opacity duration-1000"
          />
        </div>
        <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'var(--bg-pattern)', zIndex: 0 }} />

        <div className="relative z-10">
          {route !== 'login' && <Navigation active={route} onNavigate={navigate} />}
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <BootScan key={`boot-${route}`} />
              {ActivePage === Home || ActivePage === Login ? <ActivePage onNavigate={navigate} /> : <ActivePage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SocketProvider>
  );
}
