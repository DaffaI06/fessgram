const express = require("express");
const pool = require('../db');
const {ensureAuthenticated} = require("../middleware/middleware");
const router = express.Router();

router.post("/", ensureAuthenticated, async (req, res) => {
    const email = req.user.email;
    const {post_text} = req.body;

    try{
        const newPost = await pool.query("INSERT INTO posts (posted_by, post_text) VALUES ($1, $2) RETURNING *", [email, post_text]);
        res.status(201).json({"message": "Post successfully", "post" : newPost});
    } catch(error){
        res.status(500)
    }
})

router.put("/:post_id", ensureAuthenticated, async (req, res) => {
    const { post_id } = req.params;
    const { post_text } = req.body;
    const user_email = req.user.email;

    try {
        const post = await pool.query("SELECT * FROM posts WHERE post_id = $1", [post_id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.rows[0].posted_by !== user_email) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const updatedPost = await pool.query(
            "UPDATE posts SET post_text = $1 WHERE post_id = $2 RETURNING *",
            [post_text, post_id]
        );
        res.json(updatedPost.rows[0]);
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ error: "Internal Server Error" }); // Return JSON error response
    }
});

router.delete("/:post_id", ensureAuthenticated, async (req, res) => {
    const { post_id } = req.params;
    const user_email = req.user.email;

    try {
        const post = await pool.query("SELECT * FROM posts WHERE post_id = $1", [post_id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.rows[0].posted_by !== user_email) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        await pool.query("DELETE FROM posts WHERE post_id = $1", [post_id]);
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Internal Server Error" }); // Return JSON error response
    }
});

router.get("/", async (req, res) => {
    let { offset } = req.query;
    offset = parseInt(offset) || 0;

    try {
        const posts = await pool.query(
            `SELECT 
                posts.*, 
                users.name, 
                users.avatar_url, 
                COALESCE(temp.like_count, 0) as like_count,
                COALESCE(comment_temp.comment_count, 0) AS comment_count
            FROM posts 
            JOIN users ON posts.posted_by = users.email
            LEFT JOIN (
                SELECT post_id, 
                       COUNT(*) as like_count FROM likes GROUP BY post_id
            ) AS temp ON posts.post_id = temp.post_id
            -- doesn't count nested comments, but who cares :D
            LEFT JOIN (
                SELECT parent_id, COUNT(*) AS comment_count
                FROM posts
                GROUP BY parent_id
            ) AS comment_temp ON posts.post_id = comment_temp.parent_id
            WHERE posts.parent_id IS NULL -- remove if error
            ORDER BY created_at DESC 
            LIMIT 10 OFFSET $1`,
            [offset]
        );
        res.json(posts.rows);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/:post_id", async (req, res) => {
    const {post_id} = req.params;
    try {
        const post = await pool.query(
            `SELECT posts.*, 
                    users.name, 
                    users.avatar_url, 
                    COALESCE(temp.like_count, 0) as like_count,
                    COALESCE(comment_count, 0) as comment_count
            FROM posts 
            JOIN users ON posts.posted_by = users.email
            LEFT JOIN (
                SELECT post_id, COUNT(*) AS like_count
                FROM likes
                WHERE post_id = $1
                GROUP BY post_id
            ) AS temp ON posts.post_id = temp.post_id
            LEFT JOIN (
                SELECT parent_id, COUNT(*) AS comment_count
                FROM posts
                WHERE parent_id IS NOT NULL
                GROUP BY parent_id
            ) AS comment_temp ON posts.post_id = comment_temp.parent_id
             WHERE posts.post_id = $1`,
            [post_id]
        );
        const comments = await pool.query(
            `SELECT posts.*, 
                    users.name, 
                    users.avatar_url, 
                    COALESCE(temp.like_count, 0) as like_count,
                    COALESCE(comment_temp.comment_count, 0) AS comment_count
            FROM posts 
            JOIN users ON posts.posted_by = users.email
            LEFT JOIN (
                SELECT post_id, 
                       COUNT(*) as like_count 
                FROM likes GROUP BY post_id
            ) AS temp ON posts.post_id = temp.post_id
            LEFT JOIN (
                SELECT parent_id, COUNT(*) AS comment_count
                FROM posts
                GROUP BY parent_id
            ) AS comment_temp ON posts.post_id = comment_temp.parent_id
            WHERE posts.parent_id = $1
            ORDER BY created_at DESC`,
            [post_id]
        )
        // res.json(pos.rows[0]);
        res.json({
            post: post.rows[0],
            comments: comments.rows
        });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// post comment
router.post("/:parent_id", ensureAuthenticated, async (req, res) => {
    const {parent_id} = req.params;
    const email = req.user.email;
    const {post_text} = req.body;

    try{
        const newPost = await pool.query("INSERT INTO posts (posted_by, post_text, parent_id) VALUES ($1, $2, $3) RETURNING *", [email, post_text, parent_id]);
        res.status(201).json({"message": "Post successfully", "post" : newPost});
    } catch(error){
        res.status(500)
    }
})



module.exports = router;