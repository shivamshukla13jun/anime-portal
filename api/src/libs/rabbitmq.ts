import amqp from 'amqplib';

export interface Channel {
  assertQueue(queue: string, options?: any): Promise<any>;
  sendToQueue(queue: string, message: Buffer, options?: any): boolean;
  consume(queue: string, callback: (msg: any) => void): Promise<any>;
  ack(msg: any): void;
  nack(msg: any, requeue?: boolean, allUpTo?: boolean): void;
  close(): Promise<void>;
}

export interface Connection {
  close(): Promise<void>;
  createChannel(): Promise<Channel>;
}

export class RabbitMQService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly url: string;

  constructor() {
    this.url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url) as Connection;
      this.channel = await this.connection.createChannel();
      
      // Ensure the video-render queue exists
      await this.channel.assertQueue('video-render', { durable: true });
      
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async sendToQueue(queue: string, payload: any): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }

    try {
      const message = Buffer.from(JSON.stringify(payload));
      const sent = this.channel.sendToQueue(queue, message, { persistent: true });
      
      if (!sent) {
        throw new Error('Failed to send message to queue');
      }
      
      console.log(`Message sent to queue '${queue}':`, payload);
    } catch (error) {
      console.error(`Failed to send message to queue '${queue}':`, error);
      throw error;
    }
  }

  async consumeQueue(queue: string, callback: (message: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }

    try {
      await this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            this.channel!.ack(msg);
          } catch (error) {
            console.error(`Error processing message from queue '${queue}':`, error);
            this.channel!.nack(msg, false, false); // Reject and don't requeue
          }
        }
      });
      
      console.log(`Started consuming from queue '${queue}'`);
    } catch (error) {
      console.error(`Failed to consume from queue '${queue}':`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      
      console.log('Disconnected from RabbitMQ');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
