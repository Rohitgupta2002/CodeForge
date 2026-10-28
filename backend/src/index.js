
const express = require("express");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const cors = require("cors");

const main = require("./config/db");
const redisClient = require("./config/redis");

const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");

const app = express();

// =====================================
// 1. PORT CONFIGURATION
// =====================================
const PORT = process.env.PORT || 3000;

// =====================================
// 2. CORS CONFIGURATION
// =====================================
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173"
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// =====================================
// 3. MIDDLEWARE
// =====================================
app.use(express.json());
app.use(cookieParser());

// =====================================
// 4. HEALTH CHECK ROUTE
// =====================================
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "CodeForge Backend is running"
    });
});

// =====================================
// 5. API ROUTES
// =====================================
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

// =====================================
// 6. DATABASE + REDIS CONNECTION
// =====================================
const initializeConnection = async () => {
    try {
        await Promise.all([
            main(),
            redisClient.connect()
        ]);

        console.log("MongoDB and Redis connected");

        // Start server only after connections succeed
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server listening on port ${PORT}`);
        });

    } catch (err) {
        console.error("Startup error:", err);
        process.exit(1);
    }
};

initializeConnection();
















































// const express = require('express')
// const app = express();
// require('dotenv').config();
// const main =  require('./config/db')
// const cookieParser =  require('cookie-parser');
// const authRouter = require("./routes/userAuth");
// const redisClient = require('./config/redis');
// const problemRouter = require("./routes/problemCreator");
// const submitRouter = require("./routes/submit")
// const aiRouter = require("./routes/aiChatting")
// const videoRouter = require("./routes/videoCreator");
// const cors = require('cors')

// // console.log("Hello")

// const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean);

// app.use(cors({
//     origin: allowedOrigins,
//     credentials: true
// }))

// app.use(express.json());
// app.use(cookieParser());

// app.use('/user',authRouter);
// app.use('/problem',problemRouter);
// app.use('/submission',submitRouter);
// app.use('/ai',aiRouter);
// app.use("/video",videoRouter);


// const InitalizeConnection = async ()=>{
//     try{

//         await Promise.all([main(),redisClient.connect()]);
//         console.log("DB Connected");
        
//         app.listen(process.env.PORT, ()=>{
//             console.log("Server listening at port number: "+ process.env.PORT);
//         })

//     }
//     catch(err){
//         console.log("Error: "+err);
//     }
// }


// InitalizeConnection();

