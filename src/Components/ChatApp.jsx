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
  const [searchResults, setSearchResults] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [acceptorPeerId, setAcceptorPeerId] = useState(null); // New state to pass to VideoCall

  const navigate = useNavigate();

  useEffect(() => {
    socket.on('connect_error', (error) => {
      if (error.message.includes('Authentication error')) {
        console.error('Socket authentication failed:', error.message);
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('roomId');
        navigate('/');
      }
    });

    socket.on('messageResponse', (data) => {
      setMessageData((prevMessages) => {
        if (!prevMessages.some((msg) => msg.id === data.id)) {
          return [...prevMessages, data];
        }
        return prevMessages;
      });
    });

    socket.on('incoming_video_call', (data) => {
      console.log('ChatApp received incoming_video_call:', data);
      setIncomingCall(data);
    });

    socket.on('video_call_accepted', ({ acceptorPeerId }) => {
      console.log('ChatApp received video_call_accepted:', acceptorPeerId);
      setAcceptorPeerId(acceptorPeerId);
      setIncomingCall(null);
    });

    socket.on('video_call_ended', () => {
      console.log('ChatApp received video_call_ended');
      setIncomingCall(null);
      setAcceptorPeerId(null);
    });

    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Fetching history for roomId:", roomId);
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/chat/history?roomId=${roomId}`, {
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
      console.log('Joining room:', roomId);
      socket.emit('joinRoom', { roomId });
      fetchChatHistory();
    } else {
      setMessageData([]);
      setSearchResults(null);
    }

    return () => {
      socket.off('messageResponse');
      socket.off('connect_error');
      socket.off('incoming_video_call');
      socket.off('video_call_accepted');
      socket.off('video_call_ended');
    };
  }, [socket, roomId, navigate]);

  return (
    <div className="chat-app">
      <Sidebar socket={socket} setRoomId={setRoomId} roomId={roomId} />
      <div className="chat-container">
        <ChatHeader
          socket={socket}
          roomId={roomId}
          setSearchResults={setSearchResults}
          incomingCall={incomingCall}
          setIncomingCall={setIncomingCall}
          acceptorPeerId={acceptorPeerId}
        />
        {roomId ? (
          <>
            <ChatMessages
              messageData={messageData}
              searchResults={searchResults}
              searchQuery={searchResults !== null ? searchResults.query : ''}
            />
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