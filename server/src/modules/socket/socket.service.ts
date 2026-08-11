import { getIO } from "./socket";
import { SocketEvents } from "./socket.events";

class SocketService {
  sendNotification(notification: any) {
    const io = getIO();

    notification.recipients.forEach((recipient: any) => {
      io.to(recipient.userId.toString()).emit(
        SocketEvents.NOTIFICATION,
        notification,
      );
    });
  }

  sendToUser(userId: string, event: string, payload: any) {
    getIO().to(userId).emit(event, payload);
  }

  broadcast(event: string, payload: any) {
    getIO().emit(event, payload);
  }
}

export const socketService = new SocketService();
