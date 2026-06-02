import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ServiceManagement({ businessId }) {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    duration_minutes: '',
    price: ''
  });
  const [message, setMessage] = useState('');

  // Fetch services when component loads
  useEffect(() => {
    fetchServices();
  }, [businessId]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/services/${businessId}`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      if (editingService) {
        // Update existing service
        await axios.put(`http://localhost:5000/api/services/${editingService.id}`, {
          name: formData.name,
          duration_minutes: parseInt(formData.duration_minutes),
          price: formData.price ? parseFloat(formData.price) : null
        });
        setMessage('Service updated successfully!');
      } else {
        // Add new service
        await axios.post('http://localhost:5000/api/services', {
          businessId: parseInt(businessId),
          name: formData.name,
          duration_minutes: parseInt(formData.duration_minutes),
          price: formData.price ? parseFloat(formData.price) : null
        });
        setMessage('Service added successfully!');
      }
      
      // Reset form and refresh list
      setFormData({ name: '', duration_minutes: '', price: '' });
      setShowForm(false);
      setEditingService(null);
      fetchServices();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error saving service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration_minutes: service.duration_minutes,
      price: service.price || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${serviceId}`);
        setMessage('Service deleted successfully!');
        fetchServices();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(error.response?.data?.error || 'Error deleting service');
      }
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingService(null);
    setFormData({ name: '', duration_minutes: '', price: '' });
    setMessage('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Service Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={buttonStyle('primary')}>
            + Add Service
          </button>
        )}
      </div>

      {message && (
        <div style={{ ...messageStyle, backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24' }}>
          {message}
        </div>
      )}

      {showForm && (
        <div style={formContainerStyle}>
          <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={inputGroupStyle}>
              <label>Service Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="e.g., Haircut, Dental Checkup"
              />
            </div>
            <div style={inputGroupStyle}>
              <label>Duration (minutes) *</label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="e.g., 30"
              />
            </div>
            <div style={inputGroupStyle}>
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., 500"
                step="0.01"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={buttonStyle('primary')}>
                {editingService ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={cancelForm} style={buttonStyle('secondary')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {services.length === 0 && !showForm ? (
        <p>No services added yet. Click "Add Service" to get started.</p>
      ) : (
        <div style={tableStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Service Name</th>
                <th style={thStyle}>Duration</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td style={tdStyle}>{service.name}</td>
                  <td style={tdStyle}>{service.duration_minutes} min</td>
                  <td style={tdStyle}>₹{service.price ? service.price : '—'}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(service)} style={buttonStyle('edit')}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(service.id)} style={buttonStyle('delete')}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const buttonStyle = (type) => {
  const styles = {
    primary: { padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    secondary: { padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    edit: { padding: '4px 8px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    delete: { padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
  };
  return styles[type];
};

const formContainerStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
  backgroundColor: '#f9f9f9'
};

const inputGroupStyle = {
  marginBottom: '15px'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px'
};

const tableStyle = {
  marginTop: '20px',
  overflowX: 'auto'
};

const thStyle = {
  border: '1px solid #ddd',
  padding: '12px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left'
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '10px'
};

const messageStyle = {
  padding: '10px',
  marginBottom: '20px',
  borderRadius: '4px',
  textAlign: 'center'
};

export default ServiceManagement;