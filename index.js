import { get_latest_tbm_data } from './utility.js';
import express from 'express';
import fs from 'fs';
const app = express();

const port = 3000
export const TBM_URL="https://bdx.mecatran.com/utw/ws/gtfsfeed/vehicles/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt"

get_latest_tbm_data(TBM_URL)

//  --------------------------------------------------
// GET : http://localhost:3000/tbm_latest
//  --------------------------------------------------
app.get('/tbm_latest', function(_, res) {
  let rawdata = fs.readFileSync('tbm.json');
  res.send(rawdata);
  console.log("GET /tbm_latest");
  console.log("Getting latest TBM data");
  get_latest_tbm_data(TBM_URL)
  console.log("Done getting latest TBM data");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})