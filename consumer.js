import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
})

const consumeMessages = async () => {
  const consumer = kafka.consumer({ groupId: 'test-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'taux_pannes_vehicules', fromBeginning: true });
  await consumer.subscribe({ topic: 'temps_arret_station', fromBeginning: true });
  await consumer.subscribe({ topic: 'trafic_itineraire', fromBeginning: true });
  await consumer.subscribe({ topic: 'vehicules_lignes_circulation', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic: topic,
        value: message.value.toString(),
      });
  
      // Explicitly commit the offset of the message just processed
      await consumer.commitOffsets([
        {
          topic: topic,
          partition: partition,
          offset: (BigInt(message.offset) + BigInt(1)).toString(), // Commit the next offset
        },
      ]);
    },
  });
  
};

consumeMessages();  // Call the async function to start consuming messages
