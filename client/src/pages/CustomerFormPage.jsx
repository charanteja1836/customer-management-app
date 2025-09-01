import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function CustomerFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState({
        first_name: '', last_name: '', phone_number: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            const fetchCustomer = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
                    setCustomer(response.data.data);
                } catch (error) {
                    console.error('Error fetching customer for edit:', error);
                    navigate('/');
                }
            };
            fetchCustomer();
        }
    }, [id, navigate]);

    const validateForm = () => {
        const newErrors = {};
        const alphaNumericWithLettersRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/;
        const numericRegex = /^[0-9]+$/;

        if (!customer.first_name || customer.first_name.length < 3 || !alphaNumericWithLettersRegex.test(customer.first_name)) {
            newErrors.first_name = 'First name must be at least 3 alphanumeric characters and contain at least one letter.';
        }
        if (!customer.last_name || customer.last_name.length < 3 || !alphaNumericWithLettersRegex.test(customer.last_name)) {
            newErrors.last_name = 'Last name must be at least 3 alphanumeric characters and contain at least one letter.';
        }
        if (!customer.phone_number || customer.phone_number.length !== 10 || !numericRegex.test(customer.phone_number)) {
            newErrors.phone_number = 'Phone number must be exactly 10 digits.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/customers/${id}`, customer);
            } else {
                await axios.post('http://localhost:5000/api/customers', customer);
            }
            navigate('/');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setErrors({ ...errors, api: error.response.data.error });
            } else {
                setErrors({ ...errors, api: 'An unexpected error occurred.' });
            }
            console.error('Error saving customer:', error);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ marginBottom: '20px' }}>{id ? 'Edit Customer' : 'Add New Customer'}</h1>
            </div>
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {errors.api && <p style={{ color: 'red', textAlign: 'center' }}>{errors.api}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <input type="text" placeholder="First Name" value={customer.first_name} onChange={(e) => setCustomer({ ...customer, first_name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: `1px solid ${errors.first_name ? 'red' : '#ccc'}` }} />
                        {errors.first_name && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.first_name}</p>}
                    </div>
                    <div>
                        <input type="text" placeholder="Last Name" value={customer.last_name} onChange={(e) => setCustomer({ ...customer, last_name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: `1px solid ${errors.last_name ? 'red' : '#ccc'}` }} />
                        {errors.last_name && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.last_name}</p>}
                    </div>
                    <div>
                        <input type="text" placeholder="Phone Number" value={customer.phone_number} onChange={(e) => setCustomer({ ...customer, phone_number: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: `1px solid ${errors.phone_number ? 'red' : '#ccc'}` }} />
                        {errors.phone_number && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.phone_number}</p>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', width: 'auto' }}>
                            {id ? 'Update Customer' : 'Add Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CustomerFormPage;