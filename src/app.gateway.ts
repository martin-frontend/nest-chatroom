import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class AppGateway {
  @WebSocketServer() server: Server;
  users = 0;
  record = {
    userCount: 0,
    messages: [],
  };
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {
    console.log(payload);
    this.record.messages.push(payload);
    this.server.emit('msgToClient', this.record);
  }

  @SubscribeMessage('login')
  handleLogin(client: Socket, payload: string): void {
    this.server.emit('msgToClient', this.record);
  }

  @SubscribeMessage('userCount')
  handleUserCount(client: Socket, payload: string): void {
    this.server.emit('userCount', payload);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.users--;
    this.logger.log(`Client disconnected: ${client.id}, ${this.users}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    // console.log(client);
    this.logger.log(`Client connected: ${client.id}, ${this.users}`);
  }
}
