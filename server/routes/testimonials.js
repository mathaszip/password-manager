const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Testimonial = require("../models/Testimonial");
const User = require("../models/User");

// Get all testimonials
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      include: [
        {
          model: User,
          attributes: ["email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format the response
    const formattedTestimonials = testimonials.map((testimonial) => ({
      id: testimonial.id,
      userId: testimonial.user_id,
      userEmail: testimonial.User ? testimonial.User.email : "Anonymous",
      content: testimonial.content,
      rating: testimonial.rating,
      createdAt: testimonial.createdAt,
    }));

    res.json(formattedTestimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a new testimonial
router.post("/", auth, async (req, res) => {
  try {
    const { content, rating } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user already has a testimonial
    const existingTestimonial = await Testimonial.findOne({
      where: { user_id: req.user },
    });

    let testimonial;
    const user = await User.findByPk(req.user);

    if (existingTestimonial) {
      // Update existing testimonial
      testimonial = await existingTestimonial.update({
        content,
        rating,
      });
    } else {
      // Create a new testimonial
      testimonial = await Testimonial.create({
        user_id: req.user,
        content,
        rating,
      });
    }

    // Format the response
    const response = {
      id: testimonial.id,
      userId: testimonial.user_id,
      userEmail: user ? user.email : "Anonymous",
      content: testimonial.content,
      rating: testimonial.rating,
      createdAt: testimonial.createdAt,
    };

    res.status(existingTestimonial ? 200 : 201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a testimonial
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find testimonial
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Check ownership
    if (testimonial.user_id !== parseInt(req.user)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Delete testimonial
    await testimonial.destroy();

    res.json({ message: "Testimonial removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
