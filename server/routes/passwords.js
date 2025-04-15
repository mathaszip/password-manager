const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");

// Get all passwords for a user
router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM passwords WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a new password
router.post("/", auth, async (req, res) => {
  try {
    const { title, website, username, encrypted_password, iv } = req.body;

    // Add better validation and debug logging
    console.log("Received password data:", {
      hasTitle: !!title,
      hasEncryptedPassword: !!encrypted_password,
      hasIV: !!iv,
      userId: req.user,
    });

    // Validate required fields
    if (!title || !encrypted_password || !iv) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          title: !title ? "missing" : "present",
          encrypted_password: !encrypted_password ? "missing" : "present",
          iv: !iv ? "missing" : "present",
        },
      });
    }

    // Insert the new password with PostgreSQL
    try {
      const result = await db.query(
        "INSERT INTO passwords (user_id, title, website, username, encrypted_password, iv) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          req.user,
          title,
          website || null,
          username || null,
          encrypted_password,
          iv,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        message: "Database error",
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update a password
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, website, username, encryptedPassword, iv } = req.body;

    // Find password and check ownership
    const passwordCheck = await db.query(
      "SELECT * FROM passwords WHERE id = $1",
      [id]
    );

    if (passwordCheck.rows.length === 0) {
      return res.status(404).json({ message: "Password not found" });
    }

    // Check user ownership
    if (passwordCheck.rows[0].user_id !== parseInt(req.user)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Update fields
    let query, params;
    if (encryptedPassword && iv) {
      query = `
        UPDATE passwords
        SET title = $1, website = $2, username = $3, encrypted_password = $4, iv = $5
        WHERE id = $6 AND user_id = $7
        RETURNING *
      `;
      params = [title, website, username, encryptedPassword, iv, id, req.user];
    } else {
      query = `
        UPDATE passwords
        SET title = $1, website = $2, username = $3
        WHERE id = $4 AND user_id = $5
        RETURNING *
      `;
      params = [title, website, username, id, req.user];
    }

    const result = await db.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a password
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find password and check ownership
    const passwordCheck = await db.query(
      "SELECT * FROM passwords WHERE id = $1",
      [id]
    );

    if (passwordCheck.rows.length === 0) {
      return res.status(404).json({ message: "Password not found" });
    }

    // Check user ownership
    if (passwordCheck.rows[0].user_id !== parseInt(req.user)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await db.query("DELETE FROM passwords WHERE id = $1", [id]);
    res.json({ message: "Password removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
