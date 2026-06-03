import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import Product from './components/Product';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import OrderForm from './components/OrderForm';
import Policies from './components/Policies';
import NotFound from './components/NotFound';
import ThankYou from './components/ThankYou';

// Custom lightweight history-reactive router
function useRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    window.history.pushState(null, '', to);
    window.dispatchEvent(new Event('pushstate'));
  };

  return { path: currentPath, navigate };
}

export default function App() {
  const { path, navigate } = useRouter();

  // Scroll to top on path transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [path]);

  // Routing Handler
  const renderView = () => {
    switch (path) {
      case '/':
        return (
          <div className="flex flex-col min-h-screen bg-background">
            <Header path={path} navigate={navigate} />
            <main className="flex-grow">
              <Hero navigate={navigate} />
              <About />
              <HowItWorks />
              <Product navigate={navigate} />
              <Testimonials />
              <FAQ />
              <Contact />
            </main>
            <Footer path={path} navigate={navigate} />
          </div>
        );
      case '/order':
        return <OrderForm navigate={navigate} />;
      case '/thank-you':
        return <ThankYou navigate={navigate} />;
      case '/policies':
        return (
          <div className="flex flex-col min-h-screen bg-background">
            <Policies navigate={navigate} />
            <Footer path={path} navigate={navigate} />
          </div>
        );
      default:
        return <NotFound navigate={navigate} />;
    }
  };

  return <>{renderView()}</>;
}
