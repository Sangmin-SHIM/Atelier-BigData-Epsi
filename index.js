const { exec } = require('node:child_process');
const fs = require('fs');

const url = "https://bdx.mecatran.com/utw/ws/gtfsfeed/vehicles/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt" 
const gtfsRealtimeCommand = `gtfs-realtime ${url} --output tbm.json`;

exec(gtfsRealtimeCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error}`);
    return;
  }
  //open file
  let rawdata = fs.readFileSync('tbm.json');
  let json_parsed = JSON.parse(rawdata);
  json_parsed.entity.forEach(element => {
    console.log(element.vehicle);
  }
    );
  try {
    fs.unlinkSync('tbm.json');
  
    console.log("Delete File successfully.");
  } catch (error) {
    console.log(error);
  }
});