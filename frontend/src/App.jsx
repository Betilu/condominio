import AppRouter from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;