import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, collegesAPI } from '../services/api';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    counselorId: '',
    slotStart: '',
    slotEnd: '',
    studentNotes: ''
  });
  const [newAvailability, setNewAvailability] = useState({
    slotStart: '',
    slotEnd: ''
  });
  const [approvingId, setApprovingId] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState('');

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentBookings();
      fetchCounselors();
    } else if (user?.role === 'counselor') {
      fetchCounselorBookings();
    }
  }, [user]);

  const fetchStudentBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getStudentBookings();
      setBookings(response.bookings ?? []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselorBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getCounselorBookings();
      setBookings(response.bookings ?? []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await bookingsAPI.getCounselors();
      setCounselors(response.counselors ?? []);
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    try {
      await bookingsAPI.bookSession(newBooking);
      setShowBookingModal(false);
      setNewBooking({ counselorId: '', slotStart: '', slotEnd: '', studentNotes: '' });
      fetchStudentBookings();
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
      alert('Availability set successfully');
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
      fetchCounselorBookings();
    } catch (error) {
      console.error('Failed to update booking:', error);
      alert(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'student' ? 'My Bookings' : 'Counselor Bookings'}
        </h1>
        {user?.role === 'student' && (
          <button
            onClick={() => setShowBookingModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Book Session
          </button>
        )}
        {user?.role === 'counselor' && (
          <button
            onClick={() => setShowAvailabilityModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Set Availability
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No bookings found
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {user?.role === 'student' ? 'Counselor' : 'Student'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                {(user?.role === 'student' || user?.role === 'counselor') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Video call
                  </th>
                )}
                {user?.role === 'counselor' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user?.role === 'student'
                      ? booking.counselorId?.name || 'N/A'
                      : booking.studentId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(booking.slotStart).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  {(user?.role === 'student' || user?.role === 'counselor') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user?.role === 'student' && booking.status === 'approved' && booking.meetingUrl ? (
                        <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">
                          Join video call
                        </a>
                      ) : user?.role === 'counselor' && booking.status === 'approved' && booking.meetingUrl ? (
                        <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Open link</a>
                      ) : user?.role === 'counselor' && booking.status === 'approved' ? (
                        <span className="text-gray-400">—</span>
                      ) : user?.role === 'student' ? (
                        <span className="text-gray-400">—</span>
                      ) : null}
                    </td>
                  )}
                  {user?.role === 'counselor' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === 'pending' && approvingId !== booking._id && (
                        <>
                          <button
                            onClick={() => setApprovingId(booking._id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'pending' && approvingId === booking._id && (
                        <div className="flex flex-col gap-2">
                          <input
                            type="url"
                            placeholder="Video call URL (Zoom/Meet) optional"
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-64"
                            value={meetingUrl}
                            onChange={(e) => setMeetingUrl(e.target.value)}
                          />
                          <div>
                            <button onClick={() => handleUpdateStatus(booking._id, 'approved', meetingUrl)} className="text-green-600 hover:underline mr-2">Confirm approve</button>
                            <button onClick={() => setApprovingId(null)} className="text-gray-600 hover:underline">Cancel</button>
                          </div>
                        </div>
                      )}
                      {booking.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'completed')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Mark completed
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold mb-4">Book Counseling Session</h2>
            <form onSubmit={handleBookSession}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Counselor
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newBooking.counselorId}
                  onChange={(e) => setNewBooking({ ...newBooking, counselorId: e.target.value })}
                  required
                >
                  <option value="">Select a counselor</option>
                  {counselors.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}{c.profile?.specialization ? ` (${c.profile.specialization})` : ''}</option>
                  ))}
                </select>
                {counselors.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">No counselors in your college yet.</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newBooking.slotStart}
                  onChange={(e) => setNewBooking({ ...newBooking, slotStart: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newBooking.slotEnd}
                  onChange={(e) => setNewBooking({ ...newBooking, slotEnd: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  value={newBooking.studentNotes}
                  onChange={(e) => setNewBooking({ ...newBooking, studentNotes: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Book Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold mb-4">Set Availability</h2>
            <form onSubmit={handleSetAvailability}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newAvailability.slotStart}
                  onChange={(e) => setNewAvailability({ ...newAvailability, slotStart: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newAvailability.slotEnd}
                  onChange={(e) => setNewAvailability({ ...newAvailability, slotEnd: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Set Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
