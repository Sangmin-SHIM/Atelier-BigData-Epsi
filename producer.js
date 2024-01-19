import { calculate_average_stop_duration, execute_write_json_station_stop_time, get_top_routes, get_actual_vehicle_failures, get_latest_tbm_data, send_messages, sleep } from './utility.js'

const produceMessages = async () => {
	// Set intervals for all tasks
	setInterval(handleTop5Routes, 30000); // Runs every 30 seconds
	setInterval(handleVehicleFailures, 60000); // Runs every 60 seconds
	setInterval(handleTopRoutes, 30000); // Runs every 30 seconds
	setInterval(execute_write_json_station_stop_time, 60000); // Runs every 30 seconds
	setInterval(handleAverageStopDuration, 30000); // Runs every 30 seconds
};

function handleTop5Routes() {
	get_latest_tbm_data().then(actualTBMJson => {
		get_top_routes(actualTBMJson.entity, 5).then(top_5_routes => {
			let top_5_routes_json = JSON.stringify(top_5_routes);
			let message = {
				value: top_5_routes_json,
			};
			send_messages("trafic_itineraire", [message]);
		});
	});
}

function handleTopRoutes() {
	get_latest_tbm_data().then(actualTBMJson => {
		get_top_routes(actualTBMJson.entity, 0).then(top_routes => {
			let top_routes_json = JSON.stringify(top_routes);
			let message = {
				value: top_routes_json,
			};
			send_messages("vehicules_lignes_circulation", [message]);
		});
	});
}

function handleVehicleFailures() {
	get_latest_tbm_data().then(actualTBMJson => {
		sleep(30000).then(() => {
			get_latest_tbm_data().then(secondTBMJson => {
				get_actual_vehicle_failures(actualTBMJson.entity, secondTBMJson.entity).then(failures => {
					let failures_json = JSON.stringify(failures);
					let message = {
						value: failures_json,
					};
					send_messages("taux_pannes_vehicules", [message]);
				});
			});
		});
	});
}

function handleAverageStopDuration() {
	calculate_average_stop_duration().then(average_time_in_stop_station => {
		let average_time_in_stop_station_json = JSON.stringify(average_time_in_stop_station);
		let message = {
			value: average_time_in_stop_station_json,
		};
		send_messages("temps_arret_station", [message]);
	});
}

produceMessages(); // Call the async function to start producing messages