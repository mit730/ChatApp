import React, { useState } from 'react';
// import './MessageInput.css';

const MessageInput = ({ socket, roomId, setMessageData }) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const uploadImage = async () => {
    if (!image) return null;

    const formData = new FormData();
    formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${process.env.REACT_APP_BASE_URL}/chat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!roomId) return;

    let messageData = {
      roomId,
      name: localStorage.getItem('userName'),
      id: `${socket.id}${Math.random()}`,
      socketID: socket.id,
      timestamp: new Date().toISOString(),
    };

    if (image) {
      const imageUrl = await uploadImage();
      if (imageUrl) {
        messageData = {
          ...messageData,
          text: message.trim() || 'Image',
          isMedia: true,
          mediaUrl: imageUrl,
        };
      } else {
        alert('Failed to upload image');
        setImage(null);
        return;
      }
    } else if (message.trim()) {
      messageData = {
        ...messageData,
        text: message,
        isMedia: false,
        mediaUrl: '',
      };
    } else {
      return; // No message or image to send
    }

    setMessageData((prevMessages) => [...prevMessages, messageData]);
    socket.emit('send_message', messageData);
    setMessage('');
    setImage(null);
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
        <label className="image-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          📎 {image ? image.name : 'Attach Image'}
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default MessageInput;