import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function(){
    https.get(process.env.API_URL, (res)=>{
        if(res.statusCode === 200 ) console.log("Get request sent succesfully");
        else console.log("Get requets failed", res.statusCode);
    })
    .on("error", (err)=>{
        console.log("Error sending get request", err);
    });
});

export default job;

//CORN JOB EXPLANATION:
//Corn jobs are scheduled tasks that are run periodically at fixed intervals
//We want to send 1 get request in every 14 minutes

//How to define "schedule"?
//You define a schedule using corn expression, which consisits of 5 fields representing:
//! Minute, Hour, Day of Month, Month, Day of Week

//Example && Explanation
//* 14 * * * * --> every 14 minutes
//* 0 0 * * 0 --> every Sunday at midnight
//* 30 3 15 * * --> At 3:30am, every 15th of month
//* 0 0 1 1 * --> Every January 1st at midnight
//* 0 * * * * --> Every hour
