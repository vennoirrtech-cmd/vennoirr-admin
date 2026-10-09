import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import ComingSoon from './pages/ComingSoon';
import Storefront from './pages/StorefrontManager';
import Inventory from './pages/Inventory';
import Returns from './pages/Returns';
import Discounts from './pages/Discounts';
import Payments from './pages/Payments';
import Shipping from './pages/Shipping';
import Reports from './pages/Reports';
import Reviews from './pages/Reviews';
import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />
            {/* Products */}
            <Route path="products" element={<Products />} />
            <Route path="products/add" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            {/* Orders */}
            <Route path="orders" element={<Orders />} />
            {/* Customers */}
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            {/* Categories */}
            <Route path="categories" element={<Categories />} />
            {/* Settings */}
            <Route path="settings" element={<Settings />} />
            
            {/* Storefront / Layout Configuration */}
            <Route path="storefront" element={<Storefront />} />
            {/* Inventory Overview */}
            <Route path="inventory" element={<Inventory />} />
            <Route path="returns" element={<Returns />} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="discounts" element={<Discounts />} />
            
            {/* Coming Soon */}
            <Route path="reviews" element={<Reviews />} />
            <Route path="reports" element={<Reports />} />
            <Route path="team" element={<ComingSoon />} />
            <Route path="payments" element={<Payments />} />
            
            {/* Catch-all */}
            <Route path="*" element={<ComingSoon />} />
          </Route>
          {/* Auth Route */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
