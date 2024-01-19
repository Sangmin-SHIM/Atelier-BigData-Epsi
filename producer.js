import { calculate_average_stop_duration, execute_write_json_station_stop_time } from './utility.js'

const produceMessages = async () => {
  while (true) {
    await execute_write_json_station_stop_time(600)
    break;
  }
  const average_time_in_stop_station = await calculate_average_stop_duration()
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