import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StaffManagement({ businessId }) {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStaff();
  }, [businessId]);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/staff/${businessId}`);
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      if (editingStaff) {
        await axios.put(`http://localhost:5000/api/staff/${editingStaff.id}`, {
          name: formData.name,
          role: formData.role
        });
        setMessage('Staff member updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/staff', {
          businessId: parseInt(businessId),
          name: formData.name,
          role: formData.role
        });
        setMessage('Staff member added successfully!');
      }
      
      setFormData({ name: '', role: '' });
      setShowForm(false);
      setEditingStaff(null);
      fetchStaff();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error saving staff member');
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      role: staffMember.role || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`http://localhost:5000/api/staff/${staffId}`);
        setMessage('Staff member deleted successfully!');
        fetchStaff();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(error.response?.data?.error || 'Error deleting staff member');
      }
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingStaff(null);
    setFormData({ name: '', role: '' });
    setMessage('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Staff Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={buttonStyle('primary')}>
            + Add Staff Member
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
          <h3>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={inputGroupStyle}>
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="e.g., Dr. Sarah, John Smith"
              />
            </div>
            <div style={inputGroupStyle}>
              <label>Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., Dentist, Hair Stylist, Receptionist"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={buttonStyle('primary')}>
                {editingStaff ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={cancelForm} style={buttonStyle('secondary')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {staff.length === 0 && !showForm ? (
        <p>No staff members added yet. Click "Add Staff Member" to get started.</p>
      ) : (
        <div style={tableStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td style={tdStyle}>{member.name}</td>
                  <td style={tdStyle}>{member.role || '—'}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(member)} style={buttonStyle('edit')}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(member.id)} style={buttonStyle('delete')}>
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

export default StaffManagement;