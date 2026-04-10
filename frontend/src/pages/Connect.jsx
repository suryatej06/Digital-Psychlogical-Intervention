import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectAPI } from '../services/api';

const Connect = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  const [newBooking, setNewBooking] = useState({
    counselorId: '',
    bookingId: '',
    studentNotes: ''
  });

  const [newAvailability, setNewAvailability] = useState({
    slotStart: '',
    slotEnd: ''
  });
  const [joinCode, setJoinCode] = useState('');

  const fetchCounselors = useCallback(async () => {
    try {
      const response = await connectAPI.getCounselors();
      setCounselors(response.counselors ?? []);
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.role === 'student') {
        const response = await connectAPI.getStudentBookings();
        setBookings(response.bookings ?? []);
      } else if (user?.role === 'counselor') {
        const response = await connectAPI.getCounselorBookings();
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
  }, [fetchBookings, fetchCounselors, user?.role]);

  const handleCounselorSelect = async (e) => {
    const counselorId = e.target.value;
    setNewBooking({ counselorId, bookingId: '', studentNotes: '' });
    setAvailableSlots([]);

    if (!counselorId) {
      return;
    }

    try {
      const response = await connectAPI.getAvailability(counselorId);
      setAvailableSlots(response.slots ?? []);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!newBooking.bookingId) {
      alert('Please select an available time slot');
      return;
    }

    try {
      await connectAPI.bookSession({
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
      await connectAPI.setAvailability(newAvailability);
      setShowAvailabilityModal(false);
      setNewAvailability({ slotStart: '', slotEnd: '' });
      fetchBookings();
    } catch (error) {
      console.error('Failed to set availability:', error);
      alert(error.response?.data?.message || 'Failed to set availability');
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await connectAPI.updateStatus(bookingId, { status });
      fetchBookings();
    } catch (error) {
      console.error('Failed to update booking:', error);
      alert(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const copyMeetingCode = async (meetingCode) => {
    try {
      await navigator.clipboard.writeText(meetingCode);
    } catch (error) {
      console.error('Failed to copy meeting code:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'completed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'available':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const navigateToRoom = (meetingCode) => {
    if (!meetingCode) return;
    window.location.assign(`/video/${meetingCode}`);
  };

  const handleHostSession = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigateToRoom(code);
  };

  const handleJoinSession = (e) => {
    e.preventDefault();
    if (!joinCode) return;
    navigateToRoom(joinCode.trim().toUpperCase());
  };

  const readyToJoin = bookings.filter(
    (booking) => booking.status === 'approved' && booking.meetingCode
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              Connect
            </h1>
            <p className="text-gray-600 mt-2 font-medium text-lg">
              Start a session or join your professional counselling network.
            </p>
          </div>

          <div className="flex gap-4">
            {user?.role === 'student' && (
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-indigo-600/10 text-indigo-700 border border-indigo-200 px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all duration-300"
              >
                Book a slot
              </button>
            )}
            {user?.role === 'counselor' && (
              <button
                onClick={() => setShowAvailabilityModal(true)}
                className="bg-purple-600/10 text-purple-700 border border-purple-200 px-5 py-2.5 rounded-2xl font-bold hover:bg-purple-600 hover:text-white transition-all duration-300"
              >
                Set availability
              </button>
            )}
          </div>
        </div>

        {/* ── Instant Connect Section ── */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {user?.role === 'counselor' ? (
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl flex flex-col items-start border-l-4 border-l-indigo-500">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Host Session</h2>
              <p className="text-gray-500 text-sm mb-8 flex-1">
                Generate an instant meeting code and start a secure video call. Share the code with your student to let them join.
              </p>
              <button
                onClick={handleHostSession}
                className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
              >
                Start Instant Session →
              </button>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl flex flex-col items-start border-l-4 border-l-purple-500">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Join Session</h2>
              <p className="text-gray-500 text-sm mb-6 flex-1">
                Have a session code from your counsellor? Enter it below to jump directly into the private meeting room.
              </p>
              <form onSubmit={handleJoinSession} className="w-full flex gap-3">
                <input
                  type="text"
                  placeholder="Paste code (e.g. ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-2xl bg-white border-2 border-purple-100 focus:border-purple-600 outline-none transition-all font-mono font-bold tracking-widest text-lg"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-2xl bg-purple-600 text-white font-bold text-lg shadow-lg shadow-purple-200 hover:bg-purple-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 whitespace-nowrap"
                >
                  Join →
                </button>
              </form>
            </div>
          )}

          <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-3xl p-8 shadow-xl text-white flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-widest mb-4">Pro Tip</span>
              <h2 className="text-2xl font-extrabold mb-2">Safe & Secure</h2>
              <p className="opacity-80 text-sm leading-relaxed">
                All video connections are encrypted end-to-end. Your session history is stored privately in your account.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm`}>
                    U{i}
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium opacity-70">Over 500+ successful sessions today</p>
            </div>
          </div>
        </div>

        {readyToJoin.length > 0 && (
          <div className="mb-8 rounded-3xl border border-indigo-200 bg-white/70 backdrop-blur-xl p-6 shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500">Video session ready</p>
                <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
                  {readyToJoin.length === 1 ? 'Your meeting is ready to join' : 'You have active meeting rooms'}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  Open the room directly from bookings using the same meeting code generated during approval.
                </p>
              </div>
              <button
                onClick={() => navigateToRoom(readyToJoin[0].meetingCode)}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Join latest session
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {readyToJoin.map((booking) => (
                <div
                  key={`${booking._id}-ready`}
                  className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"
                >
                  <p className="text-sm font-bold text-gray-900">
                    {user?.role === 'student'
                      ? booking.counselorId?.name || 'Assigned Counsellor'
                      : booking.studentId?.name || 'Student'}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{formatDate(booking.slotStart)}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <code className="rounded-xl bg-white px-3 py-2 text-xs font-bold tracking-[0.25em] text-indigo-900">
                      {booking.meetingCode}
                    </code>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyMeetingCode(booking.meetingCode)}
                        className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                      >
                        Copy code
                      </button>
                      <button
                        onClick={() => navigateToRoom(booking.meetingCode)}
                        className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-indigo-600 mx-auto" />
            <p className="text-indigo-600 font-bold mt-4 animate-pulse">Loading schedule...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-14 text-center shadow-sm max-w-2xl mx-auto mt-12">
            <span className="text-5xl block mb-5">Calendar</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-500 font-medium text-lg">
              {user?.role === 'student'
                ? "You don't have any sessions booked yet."
                : 'You have no upcoming sessions or available to connect.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(booking.status)}`}>
                    {booking.status === 'available' ? 'Open Slot' : booking.status}
                  </span>

                  {booking.status === 'approved' && booking.meetingCode && (
                    <button
                      onClick={() => navigateToRoom(booking.meetingCode)}
                      className="text-indigo-600 hover:text-indigo-800 p-2 bg-indigo-50 rounded-xl transition-colors shrink-0 font-bold"
                    >
                      Join Video
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {user?.role === 'student'
                      ? booking.counselorId?.name || 'Assigned Counsellor'
                      : booking.status === 'available'
                        ? 'Available to Book'
                        : booking.studentId?.name || 'Student'}
                  </h3>

                  <div className="mt-4 space-y-2">
                    <p className="flex items-center text-gray-600 text-sm font-medium">
                      <span className="w-6 shrink-0">Time</span> {formatDate(booking.slotStart)}
                    </p>
                    <p className="flex items-center text-gray-500 text-sm">
                      <span className="w-6 shrink-0">End</span>{' '}
                      {new Date(booking.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {booking.meetingCode && booking.status === 'approved' && (
                      <div className="mt-4 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-500 uppercase mb-1">Meeting code</p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-mono tracking-[0.25em] text-indigo-900">{booking.meetingCode}</p>
                          <button
                            onClick={() => copyMeetingCode(booking.meetingCode)}
                            className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {(booking.notes || booking.studentNotes) && booking.status !== 'available' && (
                      <div className="mt-4 bg-white/50 p-3 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Notes</p>
                        <p className="text-sm text-gray-700 italic">{booking.studentNotes || booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {user?.role === 'counselor' && (
                  <div className="mt-6 pt-4 border-t border-gray-200/50 flex flex-col gap-2">
                    {booking.status === 'available' && (
                      <button
                        onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                        className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl font-bold transition-colors"
                      >
                        Remove Slot
                      </button>
                    )}

                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'approved')}
                          className="flex-1 py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-bold shadow-md shadow-emerald-200 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                          className="flex-1 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {booking.status === 'approved' && booking.meetingCode && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigateToRoom(booking.meetingCode)}
                          className="flex-1 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold transition-all"
                        >
                          Join room
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'completed')}
                          className="flex-1 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl font-bold transition-all"
                        >
                          Session Finished
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showBookingModal && (
          <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white/95 backdrop-blur-2xl border border-white/50 p-8 sm:p-10 rounded-3xl max-w-lg w-full shadow-2xl transform scale-100">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Request Session</h2>
              <p className="text-gray-500 font-medium mb-6">Select a counselor to view their available to connect.</p>

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
                    {counselors.map((counselor) => (
                      <option key={counselor._id} value={counselor._id}>
                        {counselor.name} {counselor.profile?.specialization ? `(${counselor.profile.specialization})` : ''}
                      </option>
                    ))}
                  </select>
                  {counselors.length === 0 && (
                    <p className="text-xs text-rose-500 mt-2 font-semibold">No counsellors are currently registered.</p>
                  )}
                </div>

                {newBooking.counselorId && (
                  <div className="mb-5">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Available Slots</label>
                    {availableSlots.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium">
                        This counsellor does not have any open slots right now.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {availableSlots.map((slot) => (
                          <label
                            key={slot._id}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              newBooking.bookingId === slot._id
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="slotSelection"
                              value={slot._id}
                              checked={newBooking.bookingId === slot._id}
                              onChange={(e) => setNewBooking({ ...newBooking, bookingId: e.target.value })}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                              required
                            />
                            <span className="text-sm font-semibold text-gray-800">
                              {formatDate(slot.slotStart)} - {new Date(slot.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
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
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newBooking.bookingId}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Request Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  <button
                    type="button"
                    onClick={() => setShowAvailabilityModal(false)}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition-all w-full sm:w-auto"
                  >
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

export default Connect;
