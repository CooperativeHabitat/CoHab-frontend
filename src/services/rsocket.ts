import { IdentitySerializer, JsonSerializer, RSocketClient } from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Observable } from 'rxjs';
import type { ReactiveSocket, Payload } from 'rsocket-types';

const RSOCKET_URL = import.meta.env.VITE_RSOCKET_URL || 'ws://localhost:7000/rsocket';
const MAX_STREAM_ID = 2147483647;

let rsocketConnection: ReactiveSocket<any, any> | null = null;



async function connect(): Promise<ReactiveSocket<any, any>> {
  const transportOptions = {
    url: RSOCKET_URL,
    wsCreator: (url: string | URL) => {
      return new WebSocket(url)
    },
    debug: true
  }
  const setup = {
      keepAlive: 20000,
      lifetime: 60000,
      dataMimeType: 'application/json',
      metadataMimeType: 'application/json',
    }
  const serializers = {
      data: JsonSerializer,
      metadata: JsonSerializer
    }
  
  const transport = new RSocketWebSocketClient(transportOptions)
  const client = new RSocketClient({
    setup,
    transport,
    serializers
  });
  rsocketConnection = await client.connect();
  console.log('RSocket connected');
  return rsocketConnection;
}

export const rsocketService = {

  async requestStream(route: string, data?: any): Promise<Observable<any>> {
    const socket = await connect();
    const metadata = {route: route}
    const dataStr = data

    return new Observable((subscriber) => {
      socket.requestStream({
        data: dataStr,
        metadata,
      }).subscribe({
        onNext: (payload: Payload<any, any>) => {
          try {
            const response = payload.data
            console.log(response)
            subscriber.next(response);
          } catch (error) {
            console.log(error)
            subscriber.error(error);
          }
        },
        onError: (error: any) => {
          console.error('RequestStream error:', error);
          console.log(error.source)
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
    const metadata = {route: route};
    const dataStr = data

    socket.fireAndForget({
      data: dataStr,
      metadata,
    });
  },

async requestResponse(route: string, data?: any): Promise<any> {
    const socket = await connect();
    const metadata = { route: route };
    const dataStr = data;
    console.log("trying to connect");
    
    return new Promise((resolve, reject) => {
        socket.requestResponse({
            data: dataStr,
            metadata,
        }).subscribe({
            onComplete: (payload: Payload<any, any>) => {
                try {
                    const response = payload.data;
                    console.log(response);
                    resolve(response);
                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            },
            onError: (error: any) => {
                console.log(error);
                reject(error);
            },
        });
    });
}
};