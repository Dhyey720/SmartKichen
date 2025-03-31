import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Keyfeature from './components/Keyfeature';
import Signup from './components/Signup';
import Login from './components/Login';
import Footer from './components/Footer'; // Import your Footer component
import Inventory from './components/Inventory'; // Import your Inventory component
import ProtectedRoute from './components/ProtectedRoute'; // Import the new component

function MainLayout() {
  return (
    <>
      <Home />
      <Keyfeature />
      {/* <Food /> */}
      <Footer/>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes - only accessible when logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/inventory" element={<Inventory />} />
          {/* Add other protected routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;