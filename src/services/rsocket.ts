import { RSocketClient } from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Observable } from 'rxjs';
import type { ReactiveSocket, Payload } from 'rsocket-types';

const RSOCKET_URL = import.meta.env.VITE_RSOCKET_URL || 'ws://localhost:7000/rsocket';
const MAX_STREAM_ID = 2147483647;

let rsocketConnection: ReactiveSocket<any, any> | null = null;

function createMetadata(route: string): string {
  return JSON.stringify({ route: route });
}

async function connect(): Promise<ReactiveSocket<any, any>> {
  if (rsocketConnection && rsocketConnection.availability() > 0) {
    return rsocketConnection;
  }

  const client = new RSocketClient({
    setup: {
      keepAlive: 20000,
      lifetime: 60000,
      dataMimeType: 'application/json',
      metadataMimeType: 'application/json',
    },
    transport: new RSocketWebSocketClient({
      url: RSOCKET_URL,
    }),
  });

  rsocketConnection = await client.connect();
  console.log('RSocket connected');
  return rsocketConnection;
}

export const rsocketService = {
  async connect(): Promise<ReactiveSocket<any, any>> {
    return connect();
  },

  disconnect() {
    if (rsocketConnection) {
      rsocketConnection.close();
      rsocketConnection = null;
      console.log('RSocket disconnected');
    }
  },

  async requestStream(route: string, data?: any): Promise<Observable<any>> {
    const socket = await connect();
    const metadata = createMetadata(route);
    const dataStr = data ? JSON.stringify(data) : '';

    return new Observable((subscriber) => {
      socket.requestStream({
        data: dataStr,
        metadata,
      }).subscribe({
        onNext: (payload: Payload<any, any>) => {
          try {
            const response = JSON.parse(payload.data?.toString() || '{}');
            subscriber.next(response);
          } catch (error) {
            subscriber.error(error);
          }
        },
        onError: (error: any) => {
          console.error('RequestStream error:', error);
          subscriber.error(error);
        },
        onSubscribe: (subscription: any) => {
          subscription.request(MAX_STREAM_ID);
        },
        onComplete: () => subscriber.complete(),
      });
    });
  },

  async fireAndForget(route: string, data?: any): Promise<void> {
    const socket = await connect();
    const metadata = createMetadata(route);
    const dataStr = data ? JSON.stringify(data) : '';

    socket.fireAndForget({
      data: dataStr,
      metadata,
    });
  },

  async requestResponse(route: string, data?: any): Promise<any> {
    const socket = await connect();
    const metadata = createMetadata(route);
    const dataStr = data ? JSON.stringify(data) : '';

    return new Promise((resolve, reject) => {
      socket.requestResponse({
        data: dataStr,
        metadata,
      }).subscribe({
        onComplete: (payload: Payload<any, any>) => {
          try {
            const response = JSON.parse(payload.data?.toString() || '{}');
            resolve(response);
          } catch (error) {
            reject(error);
          }
        },
        onError: (error: any) => {
          reject(error);
        },
        onSubscribe: (subscription: any) => {
          subscription.request(MAX_STREAM_ID);
        },
      });
    });
  },
};