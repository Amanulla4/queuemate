import React from 'react';
import { useParams } from 'react-router-dom';
import CustomerBooking from '../components/CustomerBooking';

function BookingPage() {
  const { businessId } = useParams();
  
  return (
    <div>
      <CustomerBooking businessId={businessId} />
    </div>
  );
}

export default BookingPage;