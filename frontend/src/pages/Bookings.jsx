import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Student booking state
  const [newBooking, setNewBooking] = useState({
    counselorId: '',
    bookingId: '',
    studentNotes: ''
  });

  // Counselor availability state
  const [newAvailability, setNewAvailability] = useState({
    slotStart: '',
    slotEnd: ''
  });

  const [approvingId, setApprovingId] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState('');

  const fetchCounselors = useCallback(async () => {
    try {
      const response = await bookingsAPI.getCounselors();
      setCounselors(response.counselors ?? []);
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.role === 'student') {
        const response = await bookingsAPI.getStudentBookings();
        setBookings(response.bookings ?? []);
      } else if (user?.role === 'counselor') {
        const response = await bookingsAPI.getCounselorBookings();
        setBookings(response.bookings ?? []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchBookings();
      fetchCounselors();
    } else if (user?.role === 'counselor') {
      fetchBookings();
    }
  }, [user, fetchBookings, fetchCounselors]);

  const handleCounselorSelect = async (e) => {
    const counselorId = e.target.value;
    setNewBooking({ counselorId, bookingId: '', studentNotes: '' });
    setAvailableSlots([]);

    if (counselorId) {
      try {
        const response = await bookingsAPI.getAvailability(counselorId);
        setAvailableSlots(response.slots ?? []);
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      }
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!newBooking.bookingId) {
      alert("Please select an available time slot");
      return;
    }
    try {
      await bookingsAPI.bookSession({
        bookingId: newBooking.bookingId,
        studentNotes: newBooking.studentNotes
      });
      setShowBookingModal(false);
      setNewBooking({ counselorId: '', bookingId: '', studentNotes: '' });
      fetchBookings();
    } catch (error) {
      console.error('Failed to book session:', error);
      alert(error.response?.data?.message || 'Failed to book session');
    }
  };

  const handleSetAvailability = async (e) => {
    e.preventDefault();
    try {
      await bookingsAPI.setAvailability(newAvailability);
      setShowAvailabilityModal(false);
      setNewAvailability({ slotStart: '', slotEnd: '' });
      fetchBookings(); // Refresh to show new available slots
    } catch (error) {
      console.error('Failed to set availability:', error);
      alert(error.response?.data?.message || 'Failed to set availability');
    }
  };

  const handleUpdateStatus = async (bookingId, status, meetingUrlToSend) => {
    try {
      await bookingsAPI.updateStatus(bookingId, { status, ...(meetingUrlToSend !== undefined && { meetingUrl: meetingUrlToSend }) });
      setApprovingId(null);
      setMeetingUrl('');
      fetchBookings();
    } catch (error) {
      console.error('Failed to update booking:', error);
      alert(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'completed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'available': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              {user?.role === 'student' ? 'My Sessions' : 'Counselling Schedule'}
            </h1>
            <p className="text-gray-600 mt-2 font-medium text-lg">
              {user?.role === 'student' ? 'Manage your upcoming check-ins and history.' : 'Manage your availability and student appointments.'}
            </p>
          </div>
          {user?.role === 'student' && (
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-xl leading-none pt-0.5">+</span> Book Session
            </button>
          )}
          {user?.role === 'counselor' && (
            <button
              onClick={() => setShowAvailabilityModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-xl leading-none pt-0.5">+</span> Set Availability
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-indigo-600 mx-auto"></div>
            <p className="text-indigo-600 font-bold mt-4 animate-pulse">Loading schedule...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-14 text-center shadow-sm max-w-2xl mx-auto mt-12">
            <span className="text-5xl block mb-5">🗓️</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-500 font-medium text-lg">
              {user?.role === 'student' ? "You don't have any sessions booked yet." : "You have no upcoming sessions or available slots."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(booking.status)}`}>
                    {booking.status === 'available' ? 'Open Slot' : booking.status}
                  </span>
                  {booking.status === 'approved' && booking.meetingUrl && (
                    <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 p-2 bg-indigo-50 rounded-xl transition-colors shrink-0" title="Join Video Call">
                      📹 Join Video
                    </a>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {user?.role === 'student'
                      ? booking.counselorId?.name || 'Assigned Counsellor'
                      : booking.status === 'available' ? 'Available to Book' : (booking.studentId?.name || 'Student')}
                  </h3>
                  
                  <div className="mt-4 space-y-2">
                    <p className="flex items-center text-gray-600 text-sm font-medium">
                      <span className="w-6 shrink-0">🕒</span> {formatDate(booking.slotStart)}
                    </p>
                    <p className="flex items-center text-gray-500 text-sm">
                      <span className="w-6 shrink-0">⌛</span> Until {new Date(booking.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {(booking.notes || booking.studentNotes) && booking.status !== 'available' && (
                      <div className="mt-4 bg-white/50 p-3 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Notes</p>
                        <p className="text-sm text-gray-700 italic">{booking.studentNotes || booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Counselor Actions */}
                {user?.role === 'counselor' && (
                  <div className="mt-6 pt-4 border-t border-gray-200/50 flex flex-col gap-2">
                    {booking.status === 'available' && (
                      <button onClick={() => handleUpdateStatus(booking._id, 'rejected')} className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl font-bold transition-colors">
                        Remove Slot
                      </button>
                    )}
                    
                    {booking.status === 'pending' && approvingId !== booking._id && (
                      <div className="flex gap-2">
                        <button onClick={() => setApprovingId(booking._id)} className="flex-1 py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-bold shadow-md shadow-emerald-200 transition-all">
                          Approve
                        </button>
                        <button onClick={() => handleUpdateStatus(booking._id, 'rejected')} className="flex-1 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-all">
                          Decline
                        </button>
                      </div>
                    )}

                    {booking.status === 'pending' && approvingId === booking._id && (
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 animate-fade-in">
                        <input
                          type="url"
                          placeholder="Video call link (optional)"
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-emerald-500"
                          value={meetingUrl}
                          onChange={(e) => setMeetingUrl(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateStatus(booking._id, 'approved', meetingUrl)} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm">Confirm</button>
                          <button onClick={() => setApprovingId(null)} className="flex-1 py-2 bg-white text-gray-500 border border-gray-200 rounded-lg text-sm font-bold">Cancel</button>
                        </div>
                      </div>
                    )}

                    {booking.status === 'approved' && (
                      <button onClick={() => handleUpdateStatus(booking._id, 'completed')} className="w-full py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl font-bold transition-all">
                        Mark Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Student Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white/95 backdrop-blur-2xl border border-white/50 p-8 sm:p-10 rounded-3xl max-w-lg w-full shadow-2xl transform scale-100">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Request Session</h2>
              <p className="text-gray-500 font-medium mb-6">Select a counselor to view their available slots.</p>
              
              <form onSubmit={handleBookSession}>
                <div className="mb-5">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Select Counsellor</label>
                  <select
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium"
                    value={newBooking.counselorId}
                    onChange={handleCounselorSelect}
                    required
                  >
                    <option value="">-- Choose --</option>
                    {counselors.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} {c.profile?.specialization ? `(${c.profile.specialization})` : ''}</option>
                    ))}
                  </select>
                  {counselors.length === 0 && <p className="text-xs text-rose-500 mt-2 font-semibold">No counsellors are currently registered.</p>}
                </div>

                {newBooking.counselorId && (
                  <div className="mb-5 animate-fade-in">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Available Slots</label>
                    {availableSlots.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium">
                        This counsellor doesn't have any open slots right now.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {availableSlots.map((slot) => (
                          <label key={slot._id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${newBooking.bookingId === slot._id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}`}>
                            <input 
                              type="radio" 
                              name="slotSelection" 
                              value={slot._id}
                              checked={newBooking.bookingId === slot._id}
                              onChange={(e) => setNewBooking({...newBooking, bookingId: e.target.value})}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                              required
                            />
                            <span className="text-sm font-semibold text-gray-800">{formatDate(slot.slotStart)} - {new Date(slot.slotEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Notes (Optional)</label>
                  <textarea
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none transition-shadow"
                    rows="3"
                    placeholder="Anything you'd like to share beforehand?"
                    value={newBooking.studentNotes}
                    onChange={(e) => setNewBooking({ ...newBooking, studentNotes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowBookingModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto">
                    Cancel
                  </button>
                  <button type="submit" disabled={!newBooking.bookingId} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed">
                    Request Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Counselor Availability Modal */}
        {showAvailabilityModal && (
          <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white/95 backdrop-blur-2xl border border-white/50 p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl transform scale-100">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Offer a Slot</h2>
              <p className="text-gray-500 font-medium mb-6">Create a block of time for students to book.</p>
              
              <form onSubmit={handleSetAvailability}>
                <div className="mb-5">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium text-gray-800"
                    value={newAvailability.slotStart}
                    onChange={(e) => setNewAvailability({ ...newAvailability, slotStart: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium text-gray-800"
                    value={newAvailability.slotEnd}
                    onChange={(e) => setNewAvailability({ ...newAvailability, slotEnd: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAvailabilityModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto">
                    Cancel
                  </button>
                  <button type="submit" className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition-all w-full sm:w-auto">
                    Publish Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Bookings;
