import { useEffect } from 'react';
import './App.css';
import Identity from './pages/Identity';

function App() {
  useEffect(() => { document.title = "Account | AdsCity" }, []);
  
  return <Identity />
}

export default App;
