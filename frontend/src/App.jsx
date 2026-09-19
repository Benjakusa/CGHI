import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './style.css';

// Public Pages
import Home from './pages/Home';
import WhatWeDo from './pages/WhatWeDo';
import Privacy from './pages/Privacy';
import Initiatives from './pages/Initiatives';
import Contact from './pages/Contact';
import News from './pages/News';
import Projects from './pages/Projects';
import About from './pages/About';
import Careers from './pages/Careers';
import Resources from './pages/Resources';

// Admin Pages
import Login from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import HeroesAdmin from './pages/admin/Heroes';
import NewsAdmin from './pages/admin/NewsAdmin';
import PartnersAdmin from './pages/admin/PartnersAdmin';
import CareersAdmin from './pages/admin/CareersAdmin';
import ResourcesAdmin from './pages/admin/ResourcesAdmin';
import JobApplications from './pages/admin/JobApplications';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/what-we-do" element={<WhatWeDo />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/initiatives" element={<Initiatives />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<News />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/resources" element={<Resources />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/heroes" element={<ProtectedRoute><HeroesAdmin /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute><NewsAdmin /></ProtectedRoute>} />
          <Route path="/admin/partners" element={<ProtectedRoute><PartnersAdmin /></ProtectedRoute>} />
          <Route path="/admin/careers" element={<ProtectedRoute><CareersAdmin /></ProtectedRoute>} />
          <Route path="/admin/resources" element={<ProtectedRoute><ResourcesAdmin /></ProtectedRoute>} />
          <Route path="/admin/job-applications" element={<ProtectedRoute><JobApplications /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;