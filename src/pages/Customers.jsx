import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Pointing to the correct search route on the backend for customers
      const response = await api.get('/search/customers');
      if (response.data?.success) {
        setCustomers(response.data.data);
      } else {
        // Fallback for mock backend or alternative layout
        setCustomers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customers-container p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted">Manage your store customers.</p>
        </div>
      </div>

      <div className="customers-controls glass mb-6">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search Contact Numbers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container glass">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Phone Number</th>
                  <th>Customer Name</th>
                  <th>Total Orders</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-8 text-muted">No customers found.</td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr key={customer._id}>
                      <td className="font-bold text-accent text-lg">{customer.phone || 'N/A'}</td>
                      <td>{customer.name || 'N/A'}</td>
                      <td>{customer.totalOrders || 0} orders</td>
                      <td className="text-right">
                        <button 
                          className="action-btn view" 
                          title="View Details"
                          onClick={() => navigate(`/customers/${customer._id}`)}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
