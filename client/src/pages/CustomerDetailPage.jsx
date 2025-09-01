import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

function CustomerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({
        address_details: '', city: '', state: '', pin_code: ''
    });
    const [errors, setErrors] = useState({});

    const fetchDetails = async () => {
        try {
            const customerRes = await axios.get(`http://localhost:5000/api/customers/${id}`);
            setCustomer(customerRes.data.data);
            const addressesRes = await axios.get(`http://localhost:5000/api/customers/${id}/addresses`);
            setAddresses(addressesRes.data.data);
        } catch (error) {
            console.error('Error fetching details:', error);
            if (error.response && error.response.status === 404) {
                navigate('/');
            }
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const validateAddress = () => {
        const newErrors = {};
        const alphaNumericWithLettersRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,.-]+$/;
        const numericRegex = /^[0-9]+$/;

        if (!newAddress.address_details || !alphaNumericWithLettersRegex.test(newAddress.address_details)) {
            newErrors.address_details = 'Address details must be alphanumeric and contain at least one letter.';
        }
        if (!newAddress.city || !alphaNumericWithLettersRegex.test(newAddress.city)) {
            newErrors.city = 'City must be alphanumeric and contain at least one letter.';
        }
        if (!newAddress.state || !alphaNumericWithLettersRegex.test(newAddress.state)) {
            newErrors.state = 'State must be alphanumeric and contain at least one letter.';
        }
        if (!newAddress.pin_code || newAddress.pin_code.length !== 6 || !numericRegex.test(newAddress.pin_code)) {
            newErrors.pin_code = 'Pin code must be a 6-digit number.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!validateAddress()) {
            return;
        }

        try {
            await axios.post(`http://localhost:5000/api/customers/${id}/addresses`, newAddress);
            setNewAddress({ address_details: '', city: '', state: '', pin_code: '' });
            setErrors({});
            fetchDetails();
        } catch (error) {
            setErrors({ ...errors, api: 'Error adding address. Please check your data.' });
            console.error('Error adding address:', error);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await axios.delete(`http://localhost:5000/api/addresses/${addressId}`);
                fetchDetails();
            } catch (error) {
                console.error('Error deleting address:', error);
            }
        }
    };

    if (!customer) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                Back to List
            </button>
            <h1 style={{ marginBottom: '10px' }}>{customer.first_name} {customer.last_name}</h1>
            <p style={{ marginBottom: '20px' }}><strong>Phone:</strong> {customer.phone_number}</p>
            <Link to={`/customers/edit/${customer.id}`} style={{ marginRight: '10px', color: '#ffc107', textDecoration: 'none' }}>Edit Customer Details</Link>

            <h2 style={{ marginTop: '30px' }}>Addresses</h2>
            {addresses.length === 0 ? <p>No addresses found.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {addresses.map(addr => (
                        <li key={addr.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <p>{addr.address_details}, {addr.city}, {addr.state}, {addr.pin_code}</p>
                            <button onClick={() => handleDeleteAddress(addr.id)} style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <h3 style={{ marginTop: '30px' }}>Add a New Address</h3>
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {errors.api && <p style={{ color: 'red', textAlign: 'center' }}>{errors.api}</p>}
                <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <input type="text" placeholder="Address Details" value={newAddress.address_details} onChange={(e) => setNewAddress({ ...newAddress, address_details: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: `1px solid ${errors.address_details ? 'red' : '#ccc'}` }} />
                        {errors.address_details && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.address_details}</p>}
                    </div>
                    <div>
                        <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: `1px solid ${errors.city ? 'red' : '#ccc'}` }} />
                        {errors.city && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.city}</p>}
                    </div>
                    <div>
                        <input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: `1px solid ${errors.state ? 'red' : '#ccc'}` }} />
                        {errors.state && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.state}</p>}
                    </div>
                    <div>
                        <input type="text" placeholder="PIN Code" value={newAddress.pin_code} onChange={(e) => setNewAddress({ ...newAddress, pin_code: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: `1px solid ${errors.pin_code ? 'red' : '#ccc'}` }} />
                        {errors.pin_code && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.pin_code}</p>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', width: 'auto' }}>
                            Add Address
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CustomerDetailPage;