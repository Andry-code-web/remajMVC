class SocketHandler {
    constructor(socket) {
      this.socket = socket;
    }
  
    emit(event, data) {
      this.socket.emit(event, data);
    }
  
    on(event, callback) {
      this.socket.on(event, callback);
    }
  
    join(room) {
      this.socket.emit('join', room);
    }
  }
  
  export default SocketHandler;