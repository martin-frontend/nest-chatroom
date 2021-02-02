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
  users = {};
  record = {
    userCount: 0,
    messages: [],
  };
  name = [];
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {
    console.log(payload)
    this.record.messages.push(payload);
    this.server.emit('msgToClient', this.record);
  }

  @SubscribeMessage('login')
  handleLogin(client: Socket, payload: string): void {
    // this.name = payload;
    this.users[client.id] = payload;
    this.record.messages.push({
      message: '已連線',
      name: payload,
      type: 'system',
    });
    this.server.emit('msgToClient', this.record);
  }

  @SubscribeMessage('userCount')
  handleUserCount(client: Socket, payload: string): void {
    this.server.emit('userCount', payload);
  }

  handleLogout(client: Socket, payload: string): void {
    // this.name = payload;
    this.record.messages.push({
      message: '已下線',
      name: payload,
      type: 'system',
    });
    this.server.emit('msgToClient', this.record);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    console.log(this.users);
    this.record.messages.push({
      message: '已離線',
      name: this.users[client.id],
      type: 'system',
    });
    this.server.emit('msgToClient', this.record);
    this.logger.log(`Client disconnected: ${client.id}, ${this.users}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    // console.log(client);
    this.logger.log(`Client connected: ${client.id}, ${this.users}`);
  }
}
