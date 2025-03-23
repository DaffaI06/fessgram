const express = require("express");
const passport = require("passport");
const pool = require('../db');
const router = express.Router();

// login route (redirect to goolge)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// google callback route
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login-failed` }),
    async (req, res) => {
        const { email, name, google_id, avatar_url } = req.user;

        try {
            const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

            if (userResult.rows.length === 0) {
                await pool.query(
                    "INSERT INTO users (email, name, google_id, avatar_url) VALUES ($1, $2, $3, $4)",
                    [email, name, google_id, avatar_url]
                );
            }

            res.redirect(process.env.FRONTEND_URL);
        } catch (error) {
            console.error("Error saving user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);


router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie("connect.sid", { path: "/" });
            res.json({ message: "Logged out" });
        });
    });
});

router.get("/me", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json(null);
    }

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [req.user.email]);
        return res.json(userResult.rows[0] || { user: null });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
