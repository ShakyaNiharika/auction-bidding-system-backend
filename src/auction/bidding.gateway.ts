import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // Adjust this in production to match your frontend URL
    },
})
export class BiddingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('BiddingGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinAuction')
    handleJoinAuction(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { auctionId: string },
    ) {
        const room = `auction_${data.auctionId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);
        return { status: 'joined', room };
    }

    @SubscribeMessage('leaveAuction')
    handleLeaveAuction(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { auctionId: string },
    ) {
        const room = `auction_${data.auctionId}`;
        client.leave(room);
        this.logger.log(`Client ${client.id} left room ${room}`);
        return { status: 'left', room };
    }

    @SubscribeMessage('joinUserRoom')
    handleJoinUserRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { userId: string },
    ) {
        const room = data.userId;
        client.join(room);
        this.logger.log(`Client ${client.id} joined user room ${room}`);
        return { status: 'joined', room };
    }

    // Helper method meant to be called from the AuctionService
    broadcastNewBid(auctionId: string, payload: any) {
        const room = `auction_${auctionId}`;
        this.server.to(room).emit('newBid', payload);
        this.logger.log(`Broadcasted newBid to room ${room}`);
    }
}
