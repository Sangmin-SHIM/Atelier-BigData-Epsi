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
        console.log("First TBM")
        const firstTBMJson = get_latest_tbm_data()

        // Wait 10 seconds
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("Second TBM")
        const secondTBMJson = get_latest_tbm_data()

        if (secondTBMJson.header.timestamp - firstTBMJson.header.timestamp > 0) {
          console.log("compare two json")
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