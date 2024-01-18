import { Kafka } from 'kafkajs';
import { process_tbm_data } from './utility.js'

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9093'],
})

const produceMessages = async () => {
  const producer = kafka.producer();

  while (true) {
    await process_tbm_data()
  }
  // try {
  //   await producer.connect();

  //   firstTBMJson.entity.forEach(async (data) => {
  //     await producer.send({
  //       topic:'tbm',
  //       messages: [
  //         { value: `${data.vehicle.vehicle.label}` },
  //       ],
  //     });
  //   })
  // } finally {
  //   // Make sure to disconnect the producer, even if an error occurs
  //   await producer.disconnect();
  // }
};

// Call the async function to produce messages
produceMessages();