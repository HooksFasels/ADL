import { Kafka } from 'kafkajs';
import { ConnectionManager } from '@/core/websocket/ConnectionManager';

export class LocationConsumer {
  private kafka: Kafka;
  private consumer: any;

  constructor(private connectionManager: ConnectionManager) {
    this.kafka = new Kafka({
      clientId: 'adl-realtime-consumer',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      connectionTimeout: 3000,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
    this.consumer = this.kafka.consumer({ groupId: 'realtime-broadcast-group' });
  }

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'location-updates', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        const payload = JSON.parse(message.value.toString());
        console.log('📢 Broadcasting location update:', payload.vehicleId);
        
        // Broadcast to all connected websocket clients
        this.connectionManager.broadcast('vehicle.location.updated', {
          vehicleId: payload.vehicleId,
          tripId: payload.tripId,
          latitude: payload.latitude,
          longitude: payload.longitude,
          speed: payload.speed,
          recordedAt: payload.recordedAt
        });
      },
    });
    
    console.log('✅ Kafka Location Consumer started');
  }
}
