const express = require("express");
const passport = require("passport");
const pool = require('../db');
const {ensureAuthenticated} = require("../middleware/middleware");
const req = require("express/lib/request");
const router = express.Router();

router.post("/", ensureAuthenticated, async (req, res) => {
    const { post_id } = req.body;
    const liked_by = req.user.email;

    try {
        const likeCheck = await pool.query(
            "SELECT * FROM likes WHERE liked_by = $1 AND post_id = $2",
            [liked_by, post_id]
        );

        if (likeCheck.rows.length > 0) {
            await pool.query("DELETE FROM likes WHERE liked_by = $1 AND post_id = $2", [liked_by, post_id]);
            return res.json({ liked: false });
        } else {
            await pool.query("INSERT INTO likes (liked_by, post_id) VALUES ($1, $2)", [liked_by, post_id]);
            return res.json({ liked: true });
        }
    } catch (err) {
        console.error("Error handling like:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;