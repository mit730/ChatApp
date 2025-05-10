import React, { useEffect, useState } from 'react';
// import './ChatHeader.css';

const ChatHeader = ({ roomId }) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCurrentUserId(data._id);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!roomId || !currentUserId) return;

    console.log("Current roomId:", roomId); // Debug roomId
    const [id1, id2] = roomId.split('-');
    const otherUserId = currentUserId === id1 ? id2 : id1;
    console.log("Extracted otherUserId:", otherUserId); // Debug otherUserId

    // Validate otherUserId as a potential ObjectId (24-character hex string)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(otherUserId);
    if (!isValidObjectId) {
      console.error('Invalid otherUserId:', otherUserId);
      setOtherUser({ username: 'Unknown User' });
      return;
    }

    const fetchOtherUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/users/${otherUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setOtherUser(data);
      } catch (error) {
        console.error('Error fetching other user:', error);
        setOtherUser({ username: 'Unknown User' });
      }
    };

    fetchOtherUser();
  }, [roomId, currentUserId]);
console.log(otherUser, "")
  return (
    <div className="chat-header">
      <h3>{otherUser ? otherUser.username : 'Loading...'}</h3>
      <p>{otherUser ? 'Online' : ''}</p>
    </div>
  );
};

export default ChatHeader;