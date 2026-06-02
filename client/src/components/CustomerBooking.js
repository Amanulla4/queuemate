import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CustomerBooking({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    staffId: '',
    customerName: '',
    customerPhone: '',
    date: '',
    time: ''
  });
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); // 1: select service, 2: select date/time, 3: customer info, 4: confirmation

  // Fetch business data on load
  useEffect(() => {
    fetchBusinessData();
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/public/business/${businessId}`);
      setBusiness(response.data.business);
      setServices(response.data.services);
      setStaff(response.data.staff);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching business:', error);
      setMessage('Error loading booking page. Please try again later.');
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/public/available-slots/${businessId}?date=${date}`);
      setAvailableSlots(response.data.availableSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleServiceSelect = (serviceId) => {
    setFormData({ ...formData, serviceId, staffId: '', date: '', time: '' });
    setStep(2);
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date, time: '' });
    fetchAvailableSlots(date);
  };

  const handleTimeSelect = (time) => {
    setFormData({ ...formData, time });
    setStep(3);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/public/appointments', {
        businessId: parseInt(businessId),
        serviceId: parseInt(formData.serviceId),
        staffId: formData.staffId ? parseInt(formData.staffId) : null,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        date: formData.date,
        time: formData.time
      });

      setMessage(response.data.message);
      setStep(4);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setFormData({
      serviceId: '',
      staffId: '',
      customerName: '',
      customerPhone: '',
      date: '',
      time: ''
    });
    setMessage('');
  };

  const getServiceName = (id) => {
    const service = services.find(s => s.id === parseInt(id));
    return service ? service.name : '';
  };

  const getStaffName = (id) => {
    if (!id) return 'Any available';
    const staffMember = staff.find(s => s.id === parseInt(id));
    return staffMember ? staffMember.name : 'Any available';
  };

  if (loading) {
    return <div style={containerStyle}><h2>Loading booking page...</h2></div>;
  }

  if (!business) {
    return <div style={containerStyle}><h2>Business not found</h2></div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Book an Appointment</h1>
        <p>with {business.business_name}</p>
      </div>

      {step === 4 ? (
        <div style={confirmationStyle}>
          <h2 style={{ color: '#28a745' }}>✓ Appointment Confirmed!</h2>
          <p>{message}</p>
          <div style={bookingDetailsStyle}>
            <p><strong>Service:</strong> {getServiceName(formData.serviceId)}</p>
            <p><strong>Staff:</strong> {getStaffName(formData.staffId)}</p>
            <p><strong>Date:</strong> {formData.date}</p>
            <p><strong>Time:</strong> {formData.time.substring(0, 5)}</p>
            <p><strong>Customer:</strong> {formData.customerName}</p>
            {formData.customerPhone && <p><strong>Phone:</strong> {formData.customerPhone}</p>}
          </div>
          <button onClick={resetBooking} style={buttonStyle}>Book Another Appointment</button>
        </div>
      ) : (
        <>
          {/* Step indicator */}
          <div style={stepIndicatorStyle}>
            <span style={stepStyle(step >= 1)}>1. Select Service</span>
            <span style={stepStyle(step >= 2)}>→ 2. Pick Date/Time →</span>
            <span style={stepStyle(step >= 3)}>3. Your Details</span>
          </div>

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div>
              <h2>Choose a service</h2>
              <div style={servicesGridStyle}>
                {services.map(service => (
                  <div key={service.id} style={serviceCardStyle} onClick={() => handleServiceSelect(service.id)}>
                    <h3>{service.name}</h3>
                    <p>Duration: {service.duration_minutes} min</p>
                    {service.price && <p>Price: ₹{service.price}</p>}
                  </div>
                ))}
              </div>
              {services.length === 0 && <p>No services available for booking yet.</p>}
            </div>
          )}

          {/* Step 2: Select Date and Time */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} style={backButtonStyle}>← Back to Services</button>
              <h2>Select date and time</h2>
              
              <div style={formGroupStyle}>
                <label>Select Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={inputStyle}
                  required
                />
              </div>

              {formData.date && (
                <div>
                  <label>Available Time Slots</label>
                  <div style={timeSlotsGridStyle}>
                    {availableSlots.length > 0 ? (
                      availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => handleTimeSelect(slot + ':00')}
                          style={timeSlotStyle}
                        >
                          {slot}
                        </button>
                      ))
                    ) : (
                      <p>No available slots for this date. Please choose another date.</p>
                    )}
                  </div>
                </div>
              )}

              {staff.length > 0 && (
                <div style={formGroupStyle}>
                  <label>Preferred Staff (Optional)</label>
                  <select
                    name="staffId"
                    value={formData.staffId}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="">Any available staff</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.id}>{member.name} - {member.role || 'Staff'}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Customer Details */}
          {step === 3 && (
            <div>
              <button onClick={() => setStep(2)} style={backButtonStyle}>← Back to Date/Time</button>
              <h2>Your details</h2>
              
              <form onSubmit={handleSubmit}>
                <div style={formGroupStyle}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    placeholder="Enter your full name"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    style={inputStyle}
                    placeholder="For SMS reminders (optional)"
                  />
                </div>

                <div style={summaryStyle}>
                  <h3>Booking Summary</h3>
                  <p><strong>Service:</strong> {getServiceName(formData.serviceId)}</p>
                  <p><strong>Staff:</strong> {getStaffName(formData.staffId)}</p>
                  <p><strong>Date:</strong> {formData.date}</p>
                  <p><strong>Time:</strong> {formData.time.substring(0, 5)}</p>
                </div>

                {message && <div style={errorStyle}>{message}</div>}

                <button type="submit" disabled={submitting} style={buttonStyle}>
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
  fontFamily: 'Arial, sans-serif'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px'
};

const servicesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '15px',
  marginTop: '20px'
};

const serviceCardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '15px',
  cursor: 'pointer',
  transition: 'all 0.3s',
  backgroundColor: '#fff'
};

const timeSlotsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
  gap: '10px',
  marginTop: '10px',
  marginBottom: '20px'
};

const timeSlotStyle = {
  padding: '10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const formGroupStyle = {
  marginBottom: '20px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '16px'
};

const buttonStyle = {
  padding: '12px 24px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px'
};

const backButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginBottom: '20px'
};

const summaryStyle = {
  backgroundColor: '#f8f9fa',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px'
};

const confirmationStyle = {
  textAlign: 'center',
  padding: '30px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px'
};

const bookingDetailsStyle = {
  textAlign: 'left',
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0'
};

const stepIndicatorStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '30px',
  padding: '10px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px'
};

const stepStyle = (active) => ({
  fontWeight: active ? 'bold' : 'normal',
  color: active ? '#007bff' : '#6c757d'
});

const errorStyle = {
  padding: '10px',
  marginBottom: '20px',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '4px',
  textAlign: 'center'
};

export default CustomerBooking;