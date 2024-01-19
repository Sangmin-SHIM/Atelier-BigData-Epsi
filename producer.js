import e from 'express';
import { process_tbm_data, send_messages } from './utility.js'
import fs from 'node:fs';

const produceMessages = async () => {
  while (true) {
    for (let i = 0; i < 1000; i++) { 
      let tbm_data = await process_tbm_data()
      if (tbm_data !== undefined) {
          let averages = tbm_data.averages
          let arr_existing=[]
          if(fs.existsSync('station_stop_time.json')) {
            arr_existing=fs.readFileSync('station_stop_time.json');
            arr_existing = JSON.parse(arr_existing);
            if (averages) {
              arr_existing.push(averages)
            }
          }
          let data = JSON.stringify(arr_existing);
          console.log("arr_existing : ", arr_existing)
          fs.writeFileSync('station_stop_time.json', data);
      }
    }
    console.log("for loop out")
    break;
  }
  console.log("while loop out")
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
      arr_stop_duration_averages.push({stopId: curr.stopId, stopDurationAcc: curr.stopDuration, count: 1, directionId: curr.directionId})
    }
  }, 0)
  console.log("arr_stop_duration_averages : ", arr_stop_duration_averages)
  return;
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