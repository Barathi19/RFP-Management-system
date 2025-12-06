import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RFPCreate from './pages/RFPCreate';
import VendorList from './pages/VendorList';
import RFPDetail from './pages/RFPDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-rfp" element={<RFPCreate />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/rfp/:id" element={<RFPDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
