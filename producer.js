import { execute_write_json_station_stop_time } from './utility.js'
import fs from 'node:fs';

const produceMessages = async () => {
  while (true) {
    await execute_write_json_station_stop_time(600)
    break;
  }
  let arr_stop_duration_averages=[]
  let rawdata = fs.readFileSync('station_stop_time.json');
  let arr_existing = JSON.parse(rawdata);

  arr_existing.reduce((_, curr) => {
    const isExist = arr_stop_duration_averages.filter((item)=> item.stopId == curr.stopId && item.directionId == curr.directionId)

    if (isExist.length > 0) {
      if (curr.timestamp < Math.floor(Date.now() / 1000) - 3600) return
      arr_stop_duration_averages.map((item) => {
        if (item.stopId == curr.stopId && item.directionId == curr.directionId) {
          item.directionId = curr.directionId
          item.stopDurationAcc += curr.stopDuration
          item.count += 1
          item.stopDurationAvg = parseFloat(item.stopDurationAcc) / parseFloat(item.count)
        }
      })
    } else {
      arr_stop_duration_averages.push({routeId: curr.routeId,stopId: curr.stopId, stopDurationAcc: curr.stopDuration, count: 1, directionId: curr.directionId})
    }
  }, 0)
  return;
};

// Call the async function to produce messages
produceMessages();
// failures.forEach(failure => {
	// 	console.log(failure.vehicle.vehicle.id.includes("bus") ? "(BUS) " : "(TRAM) ");
	// 	console.log(failure.vehicle.vehicle.id + " de la ligne " + failure.vehicle.trip.routeId + " est en panne à l'arrêt " + failure.vehicle.stopId + " depuis " + (secondTBMJson.header.timestamp - failure.vehicle.timestamp) + " seconde(s)");
	// });

  // const routeId = firstTbm.vehicle.trip.routeId;
	// 			const stopId = firstTbm.vehicle.stopId;
	// 			const directionId = firstTbm.vehicle.trip.directionId;
	// 			const route_infos = await get_route_info_by_id(routeId)
	// 			const stop_infos = await get_stop_info_by_route_id_and_stop_id(routeId, stopId)
	// 			console.log(firstTbm.vehicle.vehicle.id.includes("bus") ? "(BUS) " : "(TRAM) ");
	// 			console.log(firstTbm.vehicle.vehicle.id + " de la ligne " + route_infos.name + " est parti de l'arrêt " + stop_infos.fullLabel + " en direction de " + firstTbm.vehicle.vehicle.label + " au bout de " + (secondTbm.vehicle.timestamp - firstTbm.vehicle.timestamp) + " seconde(s)");