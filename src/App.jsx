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
import './index.css';

function App() {
  return (
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
        </Route>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
