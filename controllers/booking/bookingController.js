const mongoose = require("mongoose");
const Booking = require("../../model/booking");
const Package = require("../../model/package");

const { isValidObjectId } = mongoose;

const bookingController = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      travelers,
      specialRequests,
      packageId,
      selectedDate,
    } = req.body;

    // Validate user
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Validate packageId
    if (!packageId || !isValidObjectId(packageId)) {
      return res.status(400).json({ error: "Invalid Package ID" });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ error: "Package not found" });
    }

    // Validate selectedDate
    if (!selectedDate || !pkg.availableDates.includes(selectedDate)) {
      return res.status(400).json({ error: "Invalid or unavailable date selected" });
    }

    // Calculate total price
    const totalPrice = travelers * pkg.price;

    // Create a new booking
    const booking = new Booking({
      user: userId,
      name,
      email,
      phone,
      travelers,
      specialRequests: specialRequests || "None",
      package: pkg._id,
      packageTitle: pkg.title,
      totalPrice,
      selectedDate,
    });

    const savedBooking = await booking.save();

    res.status(201).json({ message: "Booking successful", booking: savedBooking });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Extract and format validation error messages
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors });
    }

    console.error("Error creating booking:", error);
    res.status(500).json({ error: "An error occurred while processing your booking" });
  }
};


const getUserBookings = async (req, res) => {
    try {
      const { userId } = req.params;
  
      console.log("Received userId:", userId);
  
      // Validate userId
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
  
      // Query bookings for the given userId
      const bookings = await Booking.find({ user: userId })
        .populate('package', 'title price') // Populate package details
        .exec();
  
      console.log("Query result:", bookings);
  
      if (bookings.length === 0) {
        return res.status(404).json({ message: "No bookings found for this user" });
      }
  
      res.status(200).json({ bookings });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "An error occurred while fetching the bookings" });
    }
  };
  



  
  // Cancel booking by ID
const deletebooking = async (req, res) => {
      try {
          const bookingId = req.params.id;
          const deletedBooking = await Booking.findByIdAndDelete(bookingId);
          if (!deletedBooking) {
              return res.status(404).json({ message: "Booking not found" });
          }
          res.json({ message: "Booking canceled successfully" });
      } catch (error) {
          console.error("Error canceling booking:", error);
          res.status(500).json({ message: "Internal server error" });
      }
  }
  


module.exports = {
    bookingController,
    getUserBookings,
    deletebooking
    
};
