import { io } from 'socket.io-client';

const URL = 'http://localhost:5000'; // Adjust as needed if not local

// By default, it will not connect until we manually call connect()
export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
});
