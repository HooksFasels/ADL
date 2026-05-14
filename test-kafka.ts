import { Kafka } from 'kafkajs';
const kafka = new Kafka({ clientId: 'test', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'test-group-' + Date.now() });
await consumer.connect();
await consumer.subscribe({ topic: 'location-updates', fromBeginning: false });
await consumer.run({ eachMessage: async ({ message }) => console.log('Kafka msg:', message?.value?.toString()) });
