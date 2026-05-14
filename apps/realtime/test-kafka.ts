import { Kafka } from 'kafkajs';
const kafka = new Kafka({ clientId: 'test', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'test-group-' + Date.now() });
await consumer.connect();
await consumer.subscribe({ topic: 'location-updates', fromBeginning: false });
console.log('Test Kafka Consumer listening...');
await consumer.run({ eachMessage: async ({ message }) => console.log('Kafka msg received:', message?.value?.toString()) });
