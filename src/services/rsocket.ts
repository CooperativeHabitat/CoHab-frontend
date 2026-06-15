import { BufferEncoders, encodeBearerAuthMetadata, encodeCompositeMetadata, encodeRoute, IdentitySerializer, JsonSerializer, MESSAGE_RSOCKET_AUTHENTICATION, MESSAGE_RSOCKET_COMPOSITE_METADATA, MESSAGE_RSOCKET_ROUTING, RSocketClient } from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Observable } from 'rxjs';
import type { ReactiveSocket, Payload } from 'rsocket-types';

const RSOCKET_URL = import.meta.env.COHAB_RSOCKET_URL || 'ws://localhost:7000/rsocket';
const MAX_STREAM_ID = 2147483647;

let rsocketConnection: ReactiveSocket<any, any> | null = null;

function decodeResponse(payload: Payload<any, any>): any {
    if (!payload.data) return null;
    if (typeof payload.data === 'object' && !Buffer.isBuffer(payload.data)) {
        return payload.data;
    }
    const buffer = Buffer.isBuffer(payload.data) ? payload.data : Buffer.from(payload.data);
    const jsonString = buffer.toString('utf-8');
    return jsonString ? JSON.parse(jsonString) : null;
}

async function connect(): Promise<ReactiveSocket<any, any>> {
  if(rsocketConnection != null){
    return rsocketConnection
  }
  const transportOptions = {
    debug: true,
    url: RSOCKET_URL,
    wsCreator: (url: string | URL) => new WebSocket(url),
  }
  const setup = {
      keepAlive: 20000,
      lifetime: 60000,
      dataMimeType: 'application/json',
      metadataMimeType: MESSAGE_RSOCKET_COMPOSITE_METADATA.string
    }
  
  const transport = new RSocketWebSocketClient(transportOptions, BufferEncoders)
  const client = new RSocketClient({
    setup,
    transport,
  });
  rsocketConnection = await client.connect();
  console.log('RSocket connected');
  return rsocketConnection;
}

export const rsocketService = {
  
  createMetadata(route: string) {
    const jwtToken = localStorage.getItem('token')!!;
    return encodeCompositeMetadata([
        [MESSAGE_RSOCKET_ROUTING, encodeRoute(route)],
        [MESSAGE_RSOCKET_AUTHENTICATION, encodeBearerAuthMetadata(jwtToken)]
      ])
  },

  async requestStream(route: string, data?: any): Promise<Observable<any>> {
    const metadata = this.createMetadata(route)
    const socket = await connect();
    console.log("request stream: " + route)
    
    const dataBuff = data !== undefined && data !== null ? Buffer.from(JSON.stringify(data)) : Buffer.from('{}')

    return new Observable((subscriber) => {
      socket.requestStream({
        data: dataBuff,
        metadata,
      }).subscribe({
        onNext: (payload: Payload<any, any>) => {
          try {
            const response = decodeResponse(payload);
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
    const metadata = this.createMetadata(route)
    const socket = await connect();
    console.log("sending data: "+ data)
    const dataBuff = Buffer.from(JSON.stringify(data))

    socket.fireAndForget({
      data: dataBuff,
      metadata,
    });
  },

async requestResponse(route: string, data?: any): Promise<any> {
    const socket = await connect();
    const metadata = this.createMetadata(route)
    const dataBuff = Buffer.from(JSON.stringify(data))
    
    return new Promise((resolve, reject) => {
        socket.requestResponse({
            data: dataBuff,
            metadata,
        }).subscribe({
            onComplete: (payload: Payload<any, any>) => {
                try {
                    const response = decodeResponse(payload);
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
