import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

function AppointmentCalendar({ businessId }) {
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week'); // 'week' or 'day'

  useEffect(() => {
    fetchAppointments();
  }, [businessId, currentDate, view]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      
      if (view === 'week') {
        const start = new Date(currentDate);
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        startDate = start.toISOString().split('T')[0];
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        endDate = end.toISOString().split('T')[0];
      } else {
        startDate = currentDate.toISOString().split('T')[0];
        endDate = startDate;
      }
      
      const response = await axios.get(`http://localhost:5000/api/appointments/${businessId}`, {
        params: { startDate, endDate }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/status`, { status });
      fetchAppointments();
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(a => a.date === dateStr);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return <ClockIcon className="w-4 h-4" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const weekDates = getWeekDates();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Appointment Calendar</h2>
          <p className="text-gray-500 mt-1">Manage and track all customer bookings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'week' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week View
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'day' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Day View
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-6 bg-white rounded-xl p-4 shadow-sm">
        <button
          onClick={() => {
            const newDate = new Date(currentDate);
            if (view === 'week') newDate.setDate(newDate.getDate() - 7);
            else newDate.setDate(newDate.getDate() - 1);
            setCurrentDate(newDate);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-700">
          {view === 'week' 
            ? `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          }
        </h3>
        <button
          onClick={() => {
            const newDate = new Date(currentDate);
            if (view === 'week') newDate.setDate(newDate.getDate() + 7);
            else newDate.setDate(newDate.getDate() + 1);
            setCurrentDate(newDate);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            {view === 'week' ? (
              <div className="grid grid-cols-7 gap-3">
                {weekDates.map((date, index) => {
                  const dayAppointments = getAppointmentsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                        isToday ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-gray-100'
                      }`}
                    >
                      <div className={`p-3 text-center border-b ${isToday ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                        <p className="font-semibold text-gray-700">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className={`text-2xl font-bold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                          {date.getDate()}
                        </p>
                      </div>
                      <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                        {dayAppointments.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-4">No appointments</p>
                        ) : (
                          dayAppointments.map(apt => (
                            <motion.div
                              key={apt.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setSelectedAppointment(apt)}
                              className={`p-2 rounded-lg cursor-pointer transition-all border ${getStatusColor(apt.status)}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xs font-medium">{apt.time.substring(0, 5)}</p>
                                  <p className="text-sm font-semibold mt-1">{apt.customer_name}</p>
                                  <p className="text-xs opacity-75">{apt.service_name || 'Service'}</p>
                                </div>
                                {getStatusIcon(apt.status)}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 space-y-3">
                  {getAppointmentsForDate(currentDate).length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No appointments for this day</p>
                  ) : (
                    getAppointmentsForDate(currentDate).map(apt => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setSelectedAppointment(apt)}
                        className={`p-4 rounded-lg cursor-pointer transition-all border ${getStatusColor(apt.status)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-bold text-gray-800">{apt.time.substring(0, 5)}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
                                {apt.status}
                              </span>
                            </div>
                            <p className="font-semibold text-gray-800">{apt.customer_name}</p>
                            <p className="text-sm text-gray-600">{apt.service_name || 'Service'} {apt.staff_name ? `• ${apt.staff_name}` : ''}</p>
                            {apt.customer_phone && (
                              <p className="text-xs text-gray-500 mt-1">📞 {apt.customer_phone}</p>
                            )}
                          </div>
                          <EyeIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Appointment Details Panel */}
          <AnimatePresence>
            {selectedAppointment && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Appointment Details</h3>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                    <div className="flex items-center gap-2 mt-1">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-gray-800">{selectedAppointment.customer_name}</p>
                    </div>
                  </div>

                  {selectedAppointment.customer_phone && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Contact</p>
                      <div className="flex items-center gap-2 mt-1">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-700">{selectedAppointment.customer_phone}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Service</p>
                    <p className="text-gray-800 mt-1 font-medium">{selectedAppointment.service_name || 'N/A'}</p>
                    {selectedAppointment.duration_minutes && (
                      <p className="text-xs text-gray-500 mt-0.5">Duration: {selectedAppointment.duration_minutes} min</p>
                    )}
                    {selectedAppointment.price && (
                      <p className="text-xs text-gray-500">Price: ₹{selectedAppointment.price}</p>
                    )}
                  </div>

                  {selectedAppointment.staff_name && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Staff</p>
                      <p className="text-gray-800 mt-1">{selectedAppointment.staff_name}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date & Time</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-800">
                        {new Date(selectedAppointment.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })} at {selectedAppointment.time.substring(0, 5)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedAppointment.status !== 'confirmed' && (
                        <button
                          onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all"
                        >
                          Confirm
                        </button>
                      )}
                      {selectedAppointment.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus(selectedAppointment.id, 'completed')}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all"
                        >
                          Complete
                        </button>
                      )}
                      {selectedAppointment.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(selectedAppointment.id, 'cancelled')}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                      {selectedAppointment.status !== 'no-show' && (
                        <button
                          onClick={() => updateStatus(selectedAppointment.id, 'no-show')}
                          className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-all"
                        >
                          No Show
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default AppointmentCalendar;