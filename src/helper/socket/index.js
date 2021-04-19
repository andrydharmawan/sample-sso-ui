import socketIOClient from "socket.io-client";
export const { VUE_APP_SOCKET_URL } = process.env;
export const SocketService = socketIOClient(VUE_APP_SOCKET_URL);