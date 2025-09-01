const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        address_details TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )`);
    console.log('Database tables are ready.');
});

// New regular expressions for validation.
const alphaNumericWithLettersRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,.-]+$/;
const numericRegex = /^[0-9]+$/;

// --- Customer Routes ---
app.get('/api/customers', (req, res) => {
    const { search, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
    let sql = 'SELECT * FROM customers';
    const params = [];

    if (search) {
        sql += ' WHERE first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ?';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    if (sortBy) {
        const order = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const validSortColumns = ['id', 'first_name', 'last_name', 'phone_number'];
        if (validSortColumns.includes(sortBy)) {
            sql += ` ORDER BY ${sortBy} ${order}`;
        }
    }

    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.json({ message: 'success', data: rows });
    });
});

app.get('/api/customers/:id', (req, res) => {
    const sql = 'SELECT * FROM customers WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'success', data: row });
    });
});

app.post('/api/customers', (req, res) => {
    const { first_name, last_name, phone_number } = req.body;

    if (!first_name || first_name.length < 3 || !alphaNumericWithLettersRegex.test(first_name)) {
        return res.status(400).json({ "error": "First name must be at least 3 alphanumeric characters and contain at least one letter." });
    }
    if (!last_name || last_name.length < 3 || !alphaNumericWithLettersRegex.test(last_name)) {
        return res.status(400).json({ "error": "Last name must be at least 3 alphanumeric characters and contain at least one letter." });
    }
    if (!phone_number || phone_number.length !== 10 || !numericRegex.test(phone_number)) {
        return res.status(400).json({ "error": "Phone number must be exactly 10 digits." });
    }
    
    const sql = 'INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)';
    db.run(sql, [first_name, last_name, phone_number], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ "error": "A customer with this phone number already exists." });
            }
            return res.status(400).json({ "error": err.message });
        }
        res.status(201).json({ message: 'Customer created successfully', id: this.lastID });
    });
});

app.put('/api/customers/:id', (req, res) => {
    const { first_name, last_name, phone_number } = req.body;

    if (!first_name || first_name.length < 3 || !alphaNumericWithLettersRegex.test(first_name)) {
        return res.status(400).json({ "error": "First name must be at least 3 alphanumeric characters and contain at least one letter." });
    }
    if (!last_name || last_name.length < 3 || !alphaNumericWithLettersRegex.test(last_name)) {
        return res.status(400).json({ "error": "Last name must be at least 3 alphanumeric characters and contain at least one letter." });
    }
    if (!phone_number || phone_number.length !== 10 || !numericRegex.test(phone_number)) {
        return res.status(400).json({ "error": "Phone number must be exactly 10 digits." });
    }
    
    const sql = 'UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?';
    db.run(sql, [first_name, last_name, phone_number, req.params.id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ "error": "A customer with this phone number already exists." });
            }
            return res.status(400).json({ "error": err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Customer not found or no changes made' });
        }
        res.json({ message: 'Customer updated successfully', changes: this.changes });
    });
});

app.delete('/api/customers/:id', (req, res) => {
    const sql = 'DELETE FROM customers WHERE id = ?';
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully', changes: this.changes });
    });
});

// --- Address Routes ---
app.get('/api/customers/:id/addresses', (req, res) => {
    const sql = 'SELECT * FROM addresses WHERE customer_id = ?';
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.json({ message: 'success', data: rows });
    });
});

app.post('/api/customers/:id/addresses', (req, res) => {
    const customer_id = req.params.id;
    const { address_details, city, state, pin_code } = req.body;

    if (!address_details || !alphaNumericWithLettersRegex.test(address_details)) {
        return res.status(400).json({ "error": "Address details must be alphanumeric and contain at least one letter." });
    }
    if (!city || !alphaNumericWithLettersRegex.test(city)) {
        return res.status(400).json({ "error": "City must be alphanumeric and contain at least one letter." });
    }
    if (!state || !alphaNumericWithLettersRegex.test(state)) {
        return res.status(400).json({ "error": "State must be alphanumeric and contain at least one letter." });
    }
    if (!pin_code || pin_code.length !== 6 || !numericRegex.test(pin_code)) {
        return res.status(400).json({ "error": "Pin code must be a 6-digit number." });
    }
    
    const sql = 'INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [customer_id, address_details, city, state, pin_code], function(err) {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.status(201).json({ message: 'Address added successfully', id: this.lastID });
    });
});

app.put('/api/addresses/:addressId', (req, res) => {
    const { address_details, city, state, pin_code } = req.body;

    if (!address_details || !alphaNumericWithLettersRegex.test(address_details)) {
        return res.status(400).json({ "error": "Address details must be alphanumeric and contain at least one letter." });
    }
    if (!city || !alphaNumericWithLettersRegex.test(city)) {
        return res.status(400).json({ "error": "City must be alphanumeric and contain at least one letter." });
    }
    if (!state || !alphaNumericWithLettersRegex.test(state)) {
        return res.status(400).json({ "error": "State must be alphanumeric and contain at least one letter." });
    }
    if (!pin_code || pin_code.length !== 6 || !numericRegex.test(pin_code)) {
        return res.status(400).json({ "error": "Pin code must be a 6-digit number." });
    }

    const sql = 'UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?';
    db.run(sql, [address_details, city, state, pin_code, req.params.addressId], function(err) {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Address not found or no changes made' });
        }
        res.json({ message: 'Address updated successfully', changes: this.changes });
    });
});

app.delete('/api/addresses/:addressId', (req, res) => {
    const sql = 'DELETE FROM addresses WHERE id = ?';
    db.run(sql, [req.params.addressId], function(err) {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ message: 'Address deleted successfully', changes: this.changes });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});