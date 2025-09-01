import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerListPage from './pages/CustomerListPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import CustomerFormPage from './pages/CustomerFormPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerListPage />} />
      <Route path="/customers/new" element={<CustomerFormPage />} />
      <Route path="/customers/edit/:id" element={<CustomerFormPage />} />
      <Route path="/customers/:id" element={<CustomerDetailPage />} />
    </Routes>
  );
}

export default App;