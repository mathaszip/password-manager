const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");

// Get all testimonials
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.user_id, u.email as user_email, t.content, t.rating, t.created_at
      FROM testimonials t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
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
    const existingCheck = await db.query(
      "SELECT * FROM testimonials WHERE user_id = $1",
      [req.user]
    );

    if (existingCheck.rows.length > 0) {
      // Update existing testimonial instead of creating a new one
      const result = await db.query(
        `
        UPDATE testimonials 
        SET content = $1, rating = $2, created_at = CURRENT_TIMESTAMP 
        WHERE user_id = $3
        RETURNING *
      `,
        [content, rating, req.user]
      );

      // Get user email for response
      const userResult = await db.query(
        "SELECT email FROM users WHERE id = $1",
        [req.user]
      );
      const testimonial = {
        ...result.rows[0],
        user_email: userResult.rows[0].email,
      };

      return res.json(testimonial);
    }

    // Create a new testimonial
    const result = await db.query(
      `
      INSERT INTO testimonials (user_id, content, rating)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [req.user, content, rating]
    );

    // Get user email for response
    const userResult = await db.query("SELECT email FROM users WHERE id = $1", [
      req.user,
    ]);
    const testimonial = {
      ...result.rows[0],
      user_email: userResult.rows[0].email,
    };

    res.status(201).json(testimonial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a testimonial
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the testimonial exists and belongs to the user
    const testimonialCheck = await db.query(
      "SELECT * FROM testimonials WHERE id = $1",
      [id]
    );

    if (testimonialCheck.rows.length === 0) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Check user ownership
    if (testimonialCheck.rows[0].user_id !== parseInt(req.user)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await db.query("DELETE FROM testimonials WHERE id = $1", [id]);
    res.json({ message: "Testimonial removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
