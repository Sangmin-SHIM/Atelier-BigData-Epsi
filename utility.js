import { Kafka, Partitioners } from 'kafkajs'
import { exec } from 'node:child_process'
import fs from 'node:fs'
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function get_latest_tbm_data(retryCount = 0, maxRetries = 3) {
    const gtfsRealtimeCommand = `gtfs-realtime https://bdx.mecatran.com/utw/ws/gtfsfeed/vehicles/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt --output tbm.json`;
    try {
        await execAsync(gtfsRealtimeCommand);

        if (fs.existsSync('tbm.json')) {
            let rawdata = fs.readFileSync('tbm.json');
            return JSON.parse(rawdata);
        }
    } catch (error) {
        if (error instanceof SyntaxError && retryCount < maxRetries) {
            console.error(`JSON parsing failed, retrying... (${retryCount + 1}/${maxRetries})`);
            return get_latest_tbm_data(retryCount + 1, maxRetries);
        } else {
            console.error(`Error executing command or maximum retries reached: ${error}`);
            throw error; // Rethrow the error so it can be handled by the caller
        }
    }
}

export async function get_stop_station_average_duration (vehicles_1, vehicles_2) {
  	for (const vehicle_1 of vehicles_1) {
		for (const vehicle_2 of vehicles_2) {
			if (
				vehicle_1.vehicle.vehicle.id == vehicle_2.vehicle.vehicle.id &&
				vehicle_1.vehicle.currentStatus == 'STOPPED_AT' &&
				vehicle_2.vehicle.currentStatus == 'IN_TRANSIT_TO'
			) {
				const routeId = vehicle_1.vehicle.trip.routeId
				const stopId = vehicle_1.vehicle.stopId
				const directionId = vehicle_1.vehicle.trip.directionId
				const stopInfo = await get_stop_info_by_route_id_and_stop_id(
					routeId,
					stopId
				)
					
				if (stopInfo !== undefined) {
					let object = {
						routeId: routeId,
						stopId: stopId,
						stopDuration: vehicle_2.vehicle.timestamp - vehicle_1.vehicle.timestamp,
						timestamp: vehicle_2.vehicle.timestamp,
						fullLabel: stopInfo.fullLabel,
						vehicleType: vehicle_1.vehicle.vehicle.id.includes('bus') ? 'BUS' : 'TRAM',
						stopName: stopInfo.name,
						direction: vehicle_1.vehicle.vehicle.label,
						directionId: vehicle_1.vehicle.trip.directionId
					}
					return object
				}
				return undefined
			}
		}
  	}
}

export async function get_vehicles_stop_duration (vehicles_1, vehicles_2, detect_failures = false) {
	let vehicles_stop_duration = []
	for (const vehicle_1 of vehicles_1) {
		for (const vehicle_2 of vehicles_2) {
		if (
			detect_failures &&
			vehicle_1.vehicle.vehicle.id === vehicle_2.vehicle.vehicle.id &&
			vehicle_1.vehicle.trip.routeId === vehicle_2.vehicle.trip.routeId &&
			vehicle_1.vehicle.currentStatus === 'STOPPED_AT' &&
			vehicle_2.vehicle.currentStatus === 'STOPPED_AT'
		) {
			vehicles_stop_duration.push({
			vehicle: vehicle_1,
			stop_duration: vehicle_2.vehicle.timestamp - vehicle_1.vehicle.timestamp
			})
		} else if (
			vehicle_1.vehicle.vehicle.id === vehicle_2.vehicle.vehicle.id &&
			vehicle_1.vehicle.trip.routeId === vehicle_2.vehicle.trip.routeId &&
			vehicle_1.vehicle.currentStatus === 'STOPPED_AT' &&
			vehicle_2.vehicle.currentStatus === 'IN_TRANSIT_TO'
		) {
			vehicles_stop_duration.push({
			vehicle: vehicle_1,
			stop_duration: vehicle_2.vehicle.timestamp - vehicle_1.vehicle.timestamp
			})
		}
		}
	}
	return vehicles_stop_duration
}

export async function send_messages (topic, messages) {
  	const kafka = new Kafka({
  	  	clientId: 'tbm-producer',
  	  	brokers: ['localhost:9092']
  	})
  	const producer = kafka.producer({
  	  	createPartitioner: Partitioners.LegacyPartitioner
  	})
  	try {
  	  	await producer.connect()
  	  	await producer.send({
  	  	  	topic: topic,
  	  	  	messages: messages
  	  	})
  	} finally {
  	  	await producer.disconnect()
  	}
}

export async function get_actual_vehicle_failures (vehicles_1, vehicles_2) {
  	let max_stop_duration_before_failure = 120 // in seconds
  	let actual_vehicle_failures = []
  	await get_vehicles_stop_duration(vehicles_1, vehicles_2, true).then(
  	  	vehicles_stop_duration => {
  	  	  	for (const vehicle_stop_duration of vehicles_stop_duration) {
  	  	  	  	if (vehicle_stop_duration.stop_duration > max_stop_duration_before_failure) {
  	  	  	  	  	actual_vehicle_failures.push(vehicle_stop_duration.vehicle)
  	  	  	  	}
  	  	  	}
  	  	}
  	)
  	return actual_vehicle_failures
}

//create a function that takes all the vehicles and routeid of the vehicles and create a list of the top 5 routes with the most vehicles
export async function get_top_routes (vehicles, top_n_routes = 0) {
  	let top_routes = []
  	let routeid = []
  	for (const vehicle of vehicles) {
  	  routeid.push(vehicle.vehicle.trip.routeId)
  	}
  	routeid = [...new Set(routeid)]
  	for (const route of routeid) {
  	  let count = 0
  	  for (const vehicle of vehicles) {
  	    if (vehicle.vehicle.trip.routeId === route) {
  	      count++
  	    }
  	  }
  	  top_routes.push({ route: route, count: count })
  	}
  	top_routes.sort((a, b) => (a.count < b.count ? 1 : -1))
  	if (top_n_routes > 0) {
  	  top_routes = top_routes.slice(0, top_n_routes)
  	}
  	//add route_name to the top  routes
  	for (const route of top_routes) {
  	  let route_info = await get_route_info_by_id(route.route)
  	  route.route_name = route_info.name
  	}
  	return top_routes
}

export async function get_route_info_by_id (route_id) {
  	let route_info = await fetch(`https://ws.infotbm.com/ws/1.0/network/line-informations/${route_id}`)
  	route_info = await route_info.json()
  	return route_info
}

export async function get_stop_info_by_route_id_and_stop_id (route_id, stop_id) {
	let route_info = await get_route_info_by_id(route_id)
	let stop_info = route_info.routes[0].stopPoints.find(stopPoint => stopPoint.externalCode == stop_id)
	return stop_info
}

export async function sleep (ms) {
  	return new Promise(resolve => setTimeout(resolve, ms))
}

export async function execute_write_json_station_stop_time(milliseconds = 30000) {
    try {
        const firstTBMJson = await get_latest_tbm_data();
        await sleep(milliseconds);
        const secondTBMJson = await get_latest_tbm_data();
        const areDifferentJson = secondTBMJson.header.timestamp - firstTBMJson.header.timestamp > 0;
        if (!areDifferentJson) {
            return undefined;
        }
        let averages = await get_stop_station_average_duration(firstTBMJson.entity, secondTBMJson.entity);
        if (averages !== undefined) {
            let arr_existing = [];
            if (fs.existsSync('station_stop_time.json')) {
                arr_existing = fs.readFileSync('station_stop_time.json');
                arr_existing = JSON.parse(arr_existing);
                arr_existing.push(averages);
            } else {
                arr_existing = [averages];
            }
            let data = JSON.stringify(arr_existing);
            fs.writeFileSync('station_stop_time.json', data);
        }
    } catch (error) {
        console.error('Error in execute_write_json_station_stop_time:', error);
    }
}

export async function calculate_average_stop_duration () {
	let arr_stop_duration_averages = []
	let raw_data = "[]"
	if (fs.existsSync('station_stop_time.json')) {
		raw_data = fs.readFileSync('station_stop_time.json')
	}
	let arr_existing = JSON.parse(raw_data)

	arr_existing.reduce((_, curr) => {
		const isExist = arr_stop_duration_averages.filter(item => item.stopId == curr.stopId && item.directionId == curr.directionId)

		if (isExist.length > 0) {
		if (curr.timestamp < Math.floor(Date.now() / 1000) - 3600) return
		arr_stop_duration_averages.map(item => {
			if (item.stopId == curr.stopId && item.directionId == curr.directionId) {
				item.directionId = curr.directionId
				item.stopDurationAcc += curr.stopDuration
				item.count += 1
				item.stopDurationAvg = parseFloat(item.stopDurationAcc) / parseFloat(item.count)
			}
		})
		} else {
			arr_stop_duration_averages.push({
				routeId: curr.routeId,
				stopId: curr.stopId,
				stopDurationAcc: curr.stopDuration,
				count: 1,
				directionId: curr.directionId
			})
		}
	}, 0)
	return arr_stop_duration_averages
}