import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
})

const produceMessages = async () => {
  const producer = kafka.producer();

  // I want to get the result of /tbm_latest
  const tbmRequest = await fetch('http://localhost:3000/tbm_latest');
  const tbmResponse = await tbmRequest.json();


  
  try {
    await producer.connect();

    tbmResponse.entity.forEach(async (data) => {
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