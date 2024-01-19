import { process_tbm_data, send_messages } from './utility.js'

const produceMessages = async () => {
  while (true) {
    await process_tbm_data()
    //for (let i = 0; i < 3600; i++) {
      //insertion du delai d'arret dans le json (array.push)
      //await new Promise(resolve => setTimeout(resolve, 1000));
    //}
    //moyenne et producer puis send_messages
  }
  let arr_messages1 = []
  let arr_messages2 = []
  for (let i = 0; i < 10; i++) {
    arr_messages1.push({ value: `Message tbm01 0${i}` })
  }
  await send_messages("tbm1", arr_messages1)
  for (let i = 0; i < 10; i++) {
    arr_messages2.push({ value: `Message tbm02 0${i}` })
  }
  await send_messages("tbm2", arr_messages2)
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