import { Kafka } from 'kafkajs';
import { get_latest_tbm_data } from './utility.js'

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9093'],
})

const produceMessages = async () => {
  const producer = kafka.producer();

  while (true) {

    try{
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
                  console.log("routeId : ", firstTbm.vehicle.trip.routeId)
                  console.log("stopId : ", firstTbm.vehicle.stopId)
                  console.log(firstTbm.vehicle.vehicle.id.includes("bus") ? "(BUS) ":"(TRAM) " + firstTbm.vehicle.vehicle.id + " est parti")
                  console.log("secondTbm.vehicle.timestamp - firstTbm.vehicle.timestamp = " ,secondTbm.vehicle.timestamp - firstTbm.vehicle.timestamp)
                  console.log("----------------------------------------------------------------------------")
                }
              }
            })
          })

        }
    } catch (error) {
        console.error(error)
    }
  }
  try {
    await producer.connect();

    firstTBMJson.entity.forEach(async (data) => {
      await producer.send({
        topic:'tbm',
        messages: [
          { value: `${data.vehicle.vehicle.label}` },
        ],
      });
    })
  } finally {
    // Make sure to disconnect the producer, even if an error occurs
    await producer.disconnect();
  }
  
};

// Call the async function to produce messages
produceMessages();