import jwt from 'jsonwebtoken';

export function setupSocketIO(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Socket auth token required'));
    }

    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch (error) {
      return next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.user.role === 'authority') {
      socket.join('authorities');
    } else {
      socket.join(`tourist:${socket.user.sub}`);
    }

    socket.emit('socket_ready', {
      userId: socket.user.sub,
      role: socket.user.role,
      connectedAt: new Date().toISOString(),
    });

    socket.on('disconnect', () => {
      // Disconnects are expected as mobile users move across networks.
    });
  });
}
