import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import Client from './pages/Client';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Client />} />
      </Routes>
    </Router>
  );
}

export default App;
