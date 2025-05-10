import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import './ChatApp.css';

const ChatApp = ({ socket }) => {
  const [messageData, setMessageData] = useState([]);
  const [roomId, setRoomId] = useState(localStorage.getItem('roomId'));
  const navigate = useNavigate();

  useEffect(() => {

    socket.on('messageResponse', (data) => {
      setMessageData((prevMessages) => {
        if (!prevMessages.some((msg) => msg.id === data.id)) {
          return [...prevMessages, data];
        }
        return prevMessages;
      });
    });

    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Fetching history for roomId:", roomId);
        const response = await fetch(`http://localhost:5001/api/chat/history?roomId=${roomId}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        const history = await response.json();
        console.log("Chat history response:", history);
        setMessageData(history.messages || []);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          localStorage.removeItem('roomId');
          navigate('/');
        }
      }
    };

    if (roomId) {
      socket.emit('joinRoom', { roomId });
      fetchChatHistory();
    } else {
      setMessageData([]);
    }

    return () => {
      socket.off('messageResponse');
      socket.off('connect_error');
    };
  }, [socket, roomId, navigate]);

  return (
    <div className="chat-app">
      <Sidebar socket={socket} setRoomId={setRoomId} roomId={roomId} />
      <div className="chat-container">
        <ChatHeader roomId={roomId} />
        {roomId ? (
          <>
            <ChatMessages messageData={messageData} />
            <MessageInput socket={socket} roomId={roomId} setMessageData={setMessageData} />
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Please select a chat to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;