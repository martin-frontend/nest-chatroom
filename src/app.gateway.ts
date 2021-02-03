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
  record = {
    userCount: 0,
    messages: [],
    users: {},
  };
  name = [];
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {
    this.record.messages.push(payload);
    this.server.emit('msgToClient', this.record);
  }

  @SubscribeMessage('login')
  handleLogin(client: Socket, payload: string): void {
    this.record.users[client.id] = payload;
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

  @SubscribeMessage('sendImage')
  handleSendImage(client: Socket, payload: string): void {
    const name = this.record.users[client.id];
    this.record.messages.push({
      message: payload,
      name,
      type: 'img',
    });
    this.server.emit('msgToClient', this.record);
  }

  handleLogout(client: Socket, payload: string): void {
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
    this.record.messages.push({
      message: '已離線',
      name: this.record.users[client.id],
      type: 'system',
    });
    delete this.record.users[client.id];
    this.server.emit('msgToClient', this.record);
    this.logger.log(`Client disconnected: ${client.id}, ${this.record.users}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}, ${this.record.users}`);
  }
}
