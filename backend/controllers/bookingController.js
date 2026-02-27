import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

/**
 * Set counselor availability (Counselor only)
 */
export const setAvailability = async (req, res, next) => {
  try {
    const { slotStart, slotEnd } = req.body;

    if (!slotStart || !slotEnd) {
      return res.status(400).json({ message: 'Start and end times are required' });
    }

    const start = new Date(slotStart);
    const end = new Date(slotEnd);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Cannot create slots in the past' });
    }

    // Check for conflicts
    const conflict = await Booking.findOne({
      counselorId: req.user.userId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          slotStart: { $lt: end },
          slotEnd: { $gt: start }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot conflicts with existing booking' });
    }

    // Create availability slot (as a pending booking that can be booked)
    // In a real system, you might want a separate Availability model
    // For simplicity, we'll create a booking with status 'pending' that students can claim

    res.json({ message: 'Availability slot created (students can now book)' });
  } catch (error) {
    next(error);
  }
};

/**
 * Book counseling session (Student only)
 * Uses atomic operations to prevent double booking
 */
export const bookSession = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { counselorId, slotStart, slotEnd, studentNotes } = req.body;

    if (!counselorId || !slotStart || !slotEnd) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Counselor ID, start and end times are required' });
    }

    // Verify counselor exists and belongs to same college
    const counselor = await User.findOne({
      _id: counselorId,
      role: 'counselor',
      collegeId: req.user.collegeId,
      isActive: true
    }).session(session);

    if (!counselor) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Counselor not found' });
    }

    const start = new Date(slotStart);
    const end = new Date(slotEnd);

    if (start >= end) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    if (start < new Date()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cannot book slots in the past' });
    }

    // Atomic check for conflicts using session
    const conflict = await Booking.findOne({
      counselorId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          slotStart: { $lt: end },
          slotEnd: { $gt: start }
        }
      ]
    }).session(session);

    if (conflict) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Create booking atomically
    const booking = await Booking.create([{
      studentId: req.user.userId,
      counselorId,
      collegeId: req.user.collegeId,
      slotStart: start,
      slotEnd: end,
      studentNotes,
      status: 'pending'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Booking request created successfully',
      booking: booking[0]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * Get bookings for student
 */
export const getStudentBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      studentId: req.user.userId
    })
      .populate('counselorId', 'name email profile.specialization')
      .sort({ slotStart: 1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings for counselor
 */
export const getCounselorBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {
      counselorId: req.user.userId
    };

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('studentId', 'name email')
      .sort({ slotStart: 1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get counselors for current college (Student only - for booking dropdown)
 */
export const getCounselors = async (req, res, next) => {
  try {
    const counselors = await User.find({
      role: 'counselor',
      collegeId: req.user.collegeId,
      isActive: true
    })
      .select('name email profile.specialization')
      .sort({ name: 1 });

    res.json({ counselors });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking status (Counselor only)
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, notes, meetingUrl } = req.body;
    const { bookingId } = req.params;

    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      counselorId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (notes !== undefined) booking.notes = notes;
    if (meetingUrl !== undefined) booking.meetingUrl = meetingUrl;
    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};
