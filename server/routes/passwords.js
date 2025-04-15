const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Password = require("../models/Password");
const { Op } = require("sequelize");

// Get all passwords for a user
router.get("/", auth, async (req, res) => {
  try {
    const passwords = await Password.findAll({
      where: { user_id: req.user },
      order: [["createdAt", "DESC"]],
    });

    res.json(passwords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a new password
router.post("/", auth, async (req, res) => {
  try {
    const { title, website, username, encrypted_password, iv } = req.body;

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

    // Create new password entry
    const newPassword = await Password.create({
      user_id: req.user,
      title,
      website: website || null,
      username: username || null,
      encrypted_password,
      iv,
    });

    res.status(201).json(newPassword);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update a password
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, website, username, encrypted_password, iv } = req.body;

    // Find password and check ownership
    const passwordEntry = await Password.findOne({
      where: { id },
    });

    if (!passwordEntry) {
      return res.status(404).json({ message: "Password not found" });
    }

    // Check user ownership
    if (passwordEntry.user_id !== parseInt(req.user)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Update fields
    const updateData = {
      title,
      website: website || null,
      username: username || null,
    };

    // Only update encryption data if provided
    if (encrypted_password && iv) {
      updateData.encrypted_password = encrypted_password;
      updateData.iv = iv;
    }

    // Update the record
    await passwordEntry.update(updateData);

    // Fetch the updated record
    const updatedEntry = await Password.findOne({
      where: { id },
    });

    res.json(updatedEntry);
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
    const passwordEntry = await Password.findOne({
      where: { id },
    });

    if (!passwordEntry) {
      return res.status(404).json({ message: "Password not found" });
    }

    // Check user ownership
    if (passwordEntry.user_id !== parseInt(req.user)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Delete the password
    await passwordEntry.destroy();

    res.json({ message: "Password removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
