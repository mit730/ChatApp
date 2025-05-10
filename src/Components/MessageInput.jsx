import React, { useState } from 'react';

const MessageInput = ({ socket, roomId, setMessageData }) => {
  const [message, setMessage] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    if (message.trim() && roomId) {
      const messageData = {
        roomId,
        text: message,
        name: localStorage.getItem('userName'),
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        timestamp: new Date().toISOString()
      };

      // Add the message to local state immediately
      setMessageData((prevMessages) => [...prevMessages, messageData]);

      // Emit the message via socket
      socket.emit('send_message', messageData);
      setMessage("");
    }
  };

  return (
    <div className="message-input">
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default MessageInput;