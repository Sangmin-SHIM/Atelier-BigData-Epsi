
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

export async function test() {
        const firstTBMJson = get_latest_tbm_data()

        // Wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const secondTBMJson = get_latest_tbm_data()

        const areDifferentJson = secondTBMJson.header.timestamp - firstTBMJson.header.timestamp > 0
        if (areDifferentJson) { 
          firstTBMJson.entity.forEach(async (firstTbm) => {
            secondTBMJson.entity.forEach(async (secondTbm)=> {
              if (firstTbm.vehicle.vehicle.id === secondTbm.vehicle.vehicle.id) {
                if (firstTbm.vehicle.currentStatus == 'STOPPED_AT' && secondTbm.vehicle.currentStatus == 'IN_TRANSIT_TO'){
                  const routeId = firstTbm.vehicle.trip.routeId
                  const stopId = firstTbm.vehicle.stopId
                  const directionId = firstTbm.vehicle.trip.directionId

                  const stop = await fetch(`https://ws.infotbm.com/ws/1.0/network/line-informations/${routeId}`)
                  const stopJson = await stop.json()

                  const fullLabel = stopJson.routes[directionId].stopPoints.filter((stopPoint) => {
                    return stopPoint.externalCode === stopId
                  })[0].fullLabel

                  console.log(firstTbm.vehicle.vehicle.id.includes("bus") ? "(BUS) ":"(TRAM) ")
                  console.log(firstTbm.vehicle.vehicle.id + " est parti de l'arrêt " + fullLabel + " au bout de " + (secondTbm.vehicle.timestamp - firstTbm.vehicle.timestamp) + " seconde(s)")
                  console.log("----------------------------------------------------------------------------")
                }
              }
            })
          })

        }
   
}