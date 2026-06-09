import RSocketWebSocketClient from 'rsocket-websocket-client';
import { RSocketClient } from 'rsocket-core';
import { IdentitySerializer, JsonSerializer } from 'rsocket-core';
import { encodeCompositeMetadata, encodeRoute, WellKnownMimeType } from 'rsocket-composite-metadata';
import type { ReactiveSocket, Payload } from 'rsocket-types';
import { Buffer } from 'buffer';
import { Observable } from 'rxjs';

const RSOCKET_URL = import.meta.env.VITE_RSOCKET_URL || 'ws://localhost:7000/rsocket';

let rsocketConnection: ReactiveSocket<any, any> | null = null;
let rsocketConnectionPromise: Promise<ReactiveSocket<any, any>> | null = null;

function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

function createMetadata(route: string): Buffer {
  const compositeMetadata = encodeCompositeMetadata([
    [WellKnownMimeType.MESSAGE_RSOCKET_ROUTING, encodeRoute(route)]
  ]);
  return Buffer.from(compositeMetadata);
}

function addAuthToMetadata(metadata: Buffer): Buffer {
  const token = getAuthToken();
  if (token) {
    const authMetadata = encodeCompositeMetadata([
      [WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION, Buffer.from(`Bearer ${token}`)]
    ]);
    return Buffer.concat([metadata, Buffer.from(authMetadata)]);
  }
  return metadata;
}

export const rsocketService = {
  async connect(): Promise<ReactiveSocket<any, any>> {
    if (rsocketConnection && rsocketConnection.availability() > 0) {
      return rsocketConnection;
    }

    if (rsocketConnectionPromise) {
      return rsocketConnectionPromise;
    }

    rsocketConnectionPromise = new Promise((resolve, reject) => {
      try {
        const client = new RSocketClient({
          serializers: {
            data: JsonSerializer,
            metadata: IdentitySerializer,
          },
          setup: {
            keepAlive: 20000,
            lifetime: 60000,
            dataMimeType: 'application/json',
            metadataMimeType: WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA.toString(),
          },
          transport: new RSocketWebSocketClient({
            url: RSOCKET_URL,
          }),
        });

        client.connect().then(
          (socket: ReactiveSocket<any, any>) => {
            rsocketConnection = socket;
            console.log('RSocket connected');
            resolve(socket);
          },
          (error: any) => {
            rsocketConnectionPromise = null;
            reject(error);
          }
        );
      } catch (error) {
        rsocketConnectionPromise = null;
        reject(error);
      }
    });

    return rsocketConnectionPromise;
  },

  disconnect() {
    if (rsocketConnection) {
      rsocketConnection.close();
      rsocketConnection = null;
      rsocketConnectionPromise = null;
      console.log('RSocket disconnected');
    }
  },

  async requestStream(route: string, data?: any): Promise<Observable<any>> {
    const socket = await this.connect();
    const metadata = addAuthToMetadata(createMetadata(route));
    const dataBuffer = data ? Buffer.from(JSON.stringify(data)) : Buffer.from('');
    
    return new Observable((subscriber) => {
      const subscription = socket.requestStream({
        data: dataBuffer,
        metadata: metadata,
      });

      (subscription as any).subscribe({
        onComplete: () => subscriber.complete(),
        onError: (error: Error) => subscriber.error(error),
        onNext: (payload: Payload<any, any>) => {
          try {
            const response = JSON.parse(payload.data?.toString() || '{}');
            subscriber.next(response);
          } catch (error) {
            subscriber.error(error);
          }
        },
      });
    });
  },

  async fireAndForget(route: string, data?: any): Promise<void> {
    const socket = await this.connect();
    const metadata = addAuthToMetadata(createMetadata(route));
    const dataBuffer = data ? Buffer.from(JSON.stringify(data)) : Buffer.from('');
    
    return new Promise((resolve, reject) => {
      const subscription = socket.fireAndForget({
        data: dataBuffer,
        metadata: metadata,
      });

      (subscription as any).subscribe({
        onComplete: () => resolve(),
        onError: (error: Error) => reject(error),
      });
    });
  },

  async requestResponse(route: string, data?: any): Promise<any> {
    const socket = await this.connect();
    const metadata = addAuthToMetadata(createMetadata(route));
    const dataBuffer = data ? Buffer.from(JSON.stringify(data)) : Buffer.from('');
    
    return new Promise((resolve, reject) => {
      const subscription = socket.requestResponse({
        data: dataBuffer,
        metadata: metadata,
      });

      (subscription as any).subscribe({
        onComplete: () => {},
        onError: (error: Error) => reject(error),
        onNext: (payload: Payload<any, any>) => {
          try {
            const response = JSON.parse(payload.data?.toString() || '{}');
            resolve(response);
          } catch (error) {
            reject(error);
          }
        },
      });
    });
  },
};