require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("./passport");
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const likesRoutes = require('./routes/likes');


const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, sameSite: "lax" } //true if https
    }));
app.use(passport.initialize());
app.use(passport.session());



app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/likes", likesRoutes);


app.get("/", (req, res) => {
    res.send("Hello World!");
})


const port = 3001;
app.listen(port, () => {console.log(`Server running on port ${port}`)});