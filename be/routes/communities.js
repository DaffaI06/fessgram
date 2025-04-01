const express = require("express");
const pool = require('../db');
const {ensureAuthenticated} = require("../middleware/middleware");
const router = express.Router();

router.post("/", ensureAuthenticated, async (req, res) => {
    const made_by = req.user.email;
    const {name, description, banner_url, pfp_url} = req.body;
    try {
        const newCommunity = await pool.query("INSERT INTO communities (community_name, description, made_by, banner_url, pfp_url) VALUES ($1, $2, $3, $4, $5) RETURNING *", [name, description, made_by, banner_url, pfp_url]);
        return res.json({"message": "Successfully inserted community.", "community" : newCommunity});
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
})

router.get("/", async(req, res) => {
    try{
        const communities = await pool.query("SELECT *, users.name FROM communities JOIN users on users.email = communities.made_by");
        return res.json(communities.rows);
    } catch(error){
        return res.status(500)
    }
})

router.get("/:id", async(req, res) => {

    const community_id = req.params.id;
    const user_email = req.user ? req.user.email : null;

    try{
        const query = `
            SELECT communities.*, users.name, 
                CASE WHEN community_members.user_email IS NOT NULL THEN true ELSE false END AS has_joined
            FROM communities
                JOIN users ON users.email = communities.made_by
                LEFT JOIN community_members ON community_members.community_id = communities.community_id AND community_members.user_email = $2
            WHERE communities.community_id = $1`;
        const community = await pool.query(query, [community_id, user_email]);
        if(community.rows.length === 0){
            return res.status(404).json("Community not found");
        }

        const query2 = `
            SELECT
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
            LEFT JOIN (
                SELECT parent_id, COUNT(*) AS comment_count
                FROM posts
                GROUP BY parent_id
            ) AS comment_temp ON posts.post_id = comment_temp.parent_id
            WHERE posts.parent_id IS NULL AND posts.community_id = $1
            ORDER BY created_at DESC`
        const community_posts = await pool.query(query2, [community_id])
        // error catcher creates error :p
        // if(community_posts.rows.length === 0){
        //     community_posts = null;
        // }
        const is_owner = user_email ? user_email === community.rows[0].made_by : false;
        return res.json({...community.rows[0], is_owner, posts: community_posts.rows});
    } catch(error){
        return res.status(500)
    }
})


router.delete("/:id", ensureAuthenticated, async (req, res) => {
    const community_id = req.params.id;
    const user_email = req.user.email;
    try{
        const community = await pool.query("SELECT * FROM communities WHERE community_id = $1", [community_id]);
        if (community.rows.length === 0) {
            return res.status(404)
        }
        if (community.rows[0].made_by !== user_email){
            return res.status(401)
        }

        await pool.query("DELETE FROM communities WHERE community_id = $1", [community_id]);
        return res.json({"status": "Successfully deleted"});
    } catch(error){
        console.log(error);
        return res.status(500)
    }
})

router.put("/:id", ensureAuthenticated, async (req, res) => {
    const community_id = req.params.id;
    const {name, description, banner_url, pfp_url} = req.body;
    try{
        await pool.query("UPDATE communities SET community_name = $2, description = $3, banner_url = $4, pfp_url = $5 WHERE community_id = $1", [community_id, name, description, banner_url, pfp_url]);
        return res.status(200).json("Success")
    } catch(err){
        console.log(err)
        return res.status(500)
    }
})

router.post("/:id", ensureAuthenticated, async (req, res) => {
    const community_id = req.params.id;
    const email = req.user.email;

    try{
        const joinCheck = await pool.query("SELECT * FROM community_members WHERE community_id = $1 AND user_email = $2", [community_id, email]);
        if (joinCheck.rows.length > 0){
            await pool.query("DELETE FROM community_members WHERE community_id = $1 AND user_email = $2", [community_id, email]);
            return res.json("Successfully left community");
        }
        else {
            await pool.query("INSERT INTO community_members (community_id, user_email) VALUES ($1, $2)", [community_id, email]);
            return res.json("Successfully joined community");
        }

    } catch(err){
        console.error(err);
        return res.status(500);
    }
})

router.post("/posts/:community_id", ensureAuthenticated, async (req, res) => {
    const community_id = req.params.community_id;
    const user_email = req.user.email;
    const post_text = req.body.post_text;
    try{
        await pool.query("INSERT INTO posts (posted_by, post_text, community_id) VALUES ($1,$2,$3)", [user_email, post_text, community_id])
        return res.status(201).json("Success")
    } catch(err){
        console.log(err);
        return res.status(500).json("Fail")
    }
})

module.exports = router;