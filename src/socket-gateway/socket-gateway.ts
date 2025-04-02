import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import {
  SendNotificationMessageBody,
  TokenPayload,
} from 'src/common/interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users = new Map<number, string>();

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    try {
      const jwtToken = client.handshake.auth?.Authentication.value;
      if (!jwtToken) {
        client.disconnect();
        return;
      }

      const payload: TokenPayload =
        await this.authService.verifyToken(jwtToken);

      // Simpan data user yang sudah diverifikasi ke dalam `client.data`
      client.data.user = payload;

      this.users.set(payload.userId, client.id);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.users.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.users.delete(userId);
      }
    });
  }

  @SubscribeMessage('join-campaign')
  joinCampaign(client: Socket, campaignSlug: string) {
    client.join(`campaign-${campaignSlug}`);
  }

  @SubscribeMessage('donation-notification')
  sendNotification(@MessageBody() data: SendNotificationMessageBody) {
    const { userId, message, campaignSlug, nominal } = data;

    this.server.to(`campaign-${campaignSlug}`).emit('campaign-updated', {
      campaignSlug: campaignSlug,
      amount: nominal,
    });

    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', message);
    }
  }
}
