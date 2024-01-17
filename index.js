const express = require('express');
const app = express();

const { exec } = require('node:child_process');
const fs = require('fs');
const port = 3000

const url = "https://bdx.mecatran.com/utw/ws/gtfsfeed/vehicles/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt" 
const gtfsRealtimeCommand = `gtfs-realtime ${url} --output tbm.json`

function get_latest_tbm_data() {
    exec(gtfsRealtimeCommand, (error) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
    });
}

get_latest_tbm_data();
//let rawdata = fs.readFileSync('tbm.json');
//let json_parsed = JSON.parse(rawdata);
//json_parsed.entity.forEach(element => {
//    console.log(element.vehicle);
//});

//  --------------------------------------------------
// GET : http://localhost:3000/tbm_latest
//  --------------------------------------------------
app.get('/tbm_latest', function(_, res) {
  let rawdata = fs.readFileSync('tbm.json');
  res.send(rawdata);
  console.log("GET /tbm_latest");
  console.log("Getting latest TBM data");
  get_latest_tbm_data();
  console.log("Done getting latest TBM data");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})