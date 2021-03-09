import express from "express"
import path from "path"
import {MongoClient} from "mongodb"
import devBundle from "./devBundle";
import template from "../template";


const CURRENT_WORKING_DIR = process.cwd()
const app = express()
devBundle.compile(app)


app.use("./dist", express.static(path.join(CURRENT_WORKING_DIR, "dist")))


app.get("/", (req, res) => {
    res.status(200).send(template())
})

let port = process.env.PORT || 3000
const server = app.listen(port, function onStart(error) {

    if (error) {
        console.log(error)
    }

    console.log(`server started on port ${port}`)
})

//Connection to the database
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mernBaseDB'
MongoClient.connect(url,(error,db) =>{
    if (error){
        console.log(`unable to connect to db : ${error}`)
    }
    if (db !== null){
        console.log(`database connected successfully`)
        db.close()
    }
})

//Handling uncaught exception
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});


//Handling rejection
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

//Handling SIGTERM exception gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED Shutting down gracefully');
    server.close(() => {
        console.log('Process is terminating ');
        //process.exit(1);// no need to call as server should be closed
    });
});