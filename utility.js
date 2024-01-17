
import { exec } from 'node:child_process';

export function get_latest_tbm_data(url) {

    const gtfsRealtimeCommand = `gtfs-realtime ${url} --output tbm.json`

    exec(gtfsRealtimeCommand, (error) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
    });
}

