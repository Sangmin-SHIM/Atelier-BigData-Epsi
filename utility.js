
import { Kafka, Partitioners } from 'kafkajs';
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

export async function process_tbm_data() {
  try {
    const firstTBMJson = await get_latest_tbm_data();
    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    const secondTBMJson = await get_latest_tbm_data();
    const areDifferentJson =
      secondTBMJson.header.timestamp - firstTBMJson.header.timestamp > 0;

    if (areDifferentJson) {
      for (const firstTbm of firstTBMJson.entity) {
        for (const secondTbm of secondTBMJson.entity) {
          if (
            firstTbm.vehicle.vehicle.id === secondTbm.vehicle.vehicle.id &&
            firstTbm.vehicle.currentStatus === "STOPPED_AT" &&
            secondTbm.vehicle.currentStatus === "IN_TRANSIT_TO"
          ) {
            const routeId = firstTbm.vehicle.trip.routeId;
            const stopId = firstTbm.vehicle.stopId;
            const directionId = firstTbm.vehicle.trip.directionId;

            const stop = await fetch(
              `https://ws.infotbm.com/ws/1.0/network/line-informations/${routeId}`
            );
            const stopJson = await stop.json();

            const fullLabel = stopJson.routes[directionId].stopPoints.find(
              stopPoint => stopPoint.externalCode === stopId
            ).fullLabel;

            console.log(
              firstTbm.vehicle.vehicle.id.includes("bus") ? "(BUS) " : "(TRAM) "
            );
            console.log(
              firstTbm.vehicle.vehicle.id +
			    " de la ligne " +
				stopJson.name +
                " est parti de l'arrêt " +
                fullLabel +
				" en direction de " +
				firstTbm.vehicle.vehicle.label +
                " au bout de " +
                (secondTbm.vehicle.timestamp - firstTbm.vehicle.timestamp) +
                " seconde(s)"
            );
            console.log(
              "----------------------------------------------------------------------------"
            );
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export async function send_messages(topic, messages) {
  const kafka = new Kafka({
	clientId: "tbm-producer",
	brokers: ["localhost:9092"],
  });

  const producer = kafka.producer({
	createPartitioner: Partitioners.LegacyPartitioner
  });

  try {
	await producer.connect();

	await producer.send({
		topic: topic,
		messages: messages,
	  });
  } finally {
	// Make sure to disconnect the producer, even if an error occurs
	await producer.disconnect();
  }
}