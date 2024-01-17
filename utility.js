
import { exec } from 'node:child_process';
import fs from 'node:fs';

export function get_latest_tbm_data() {

    const gtfsRealtimeCommand = `gtfs-realtime https://bdx.mecatran.com/utw/ws/gtfsfeed/vehicles/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt --output tbm.json`

    exec(gtfsRealtimeCommand, (error) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
    });
    let rawdata = fs.readFileSync('tbm.json');
    return JSON.parse(rawdata);
}

