import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
})

const consumeMessages = async () => {
  const consumer = kafka.consumer({ groupId: 'test-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'tbm', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({message }) => {
      console.log({
        value: message.value.toString(),
      });
    },
  });
};

consumeMessages();  // Call the async function to start consuming messages
