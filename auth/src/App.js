import AppRouter from './AppRouter';
import { useEffect, useState } from 'react';
import Landing from './components/Landing';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ?
        <Landing />
        : <AppRouter />
      }
    </div>
  );
}

export default App;
