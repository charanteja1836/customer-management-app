import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('first_name');
  const [sortOrder, setSortOrder] = useState('ASC');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/customers?search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
        setCustomers(response.data.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, [search, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        setCustomers(customers.filter(customer => customer.id !== id));
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px' }}>Customer List</h1>
      </div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flexGrow: 1 }}
        />
        <Link to="/customers/new" style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>
          + New Customer
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px 8px 0 0' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', border: '1px solid #dee2e6', cursor: 'pointer', borderTopLeftRadius: '8px' }} onClick={() => handleSort('id')}>
              ID {sortBy === 'id' && (sortOrder === 'ASC' ? '▲' : '▼')}
            </th>
            <th style={{ padding: '12px', border: '1px solid #dee2e6', cursor: 'pointer' }} onClick={() => handleSort('first_name')}>
              Name {sortBy === 'first_name' && (sortOrder === 'ASC' ? '▲' : '▼')}
            </th>
            <th style={{ padding: '12px', border: '1px solid #dee2e6', cursor: 'pointer' }} onClick={() => handleSort('phone_number')}>
              Phone Number {sortBy === 'phone_number' && (sortOrder === 'ASC' ? '▲' : '▼')}
            </th>
            <th style={{ padding: '12px', border: '1px solid #dee2e6', borderTopRightRadius: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: '12px' }}>{customer.id}</td>
              <td style={{ padding: '12px' }}>{customer.first_name} {customer.last_name}</td>
              <td style={{ padding: '12px' }}>{customer.phone_number}</td>
              <td style={{ padding: '12px', display: 'flex', gap: '5px' }}>
                <Link to={`/customers/${customer.id}`} style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '12px' }}>Details</Link>
                <Link to={`/customers/edit/${customer.id}`} style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '4px', fontSize: '12px' }}>Edit</Link>
                <button onClick={() => handleDelete(customer.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerListPage;