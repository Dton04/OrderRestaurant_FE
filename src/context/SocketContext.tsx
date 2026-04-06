import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

// TODO: Thay bằng biến môi trường nếu deploy production, ví dụ process.env.VITE_API_URL
const SOCKET_URL = 'http://localhost:3000';

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Kết nối tới WebSocket server
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server:', socketInstance.id);
      setIsConnected(true);

      // Phân quyền và join room dựa vào role/userId đang đăng nhập
      const userRaw = localStorage.getItem('user');
      let role = 'customer'; // Default
      let userId: string | number | undefined = undefined;

      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          role = user.role?.toLowerCase() || 'customer';
          userId = user.id;
        } catch (e) {
          console.error('Failed to parse user from localstorage', e);
        }
      }

      // Phát tín hiệu tham gia phòng
      socketInstance.emit('join_room', { role, userId });
    });

    socketInstance.on('joined', (data) => {
      console.log('Joined socket room:', data);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
