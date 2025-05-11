import React, { useEffect, useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ socket, setRoomId, roomId }) => {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const currentUser = localStorage.getItem('userName');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/me`, {
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

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log(data, "data");
        setUsers(data.filter((user) => user.username !== currentUser));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, [currentUser]);

  const handleChatSelect = (contactId) => {
    if (!currentUserId) return;
    const sortedIds = [currentUserId, contactId].sort();
    const newRoomId = sortedIds.join('-');
    console.log("Setting roomId:", newRoomId);
    setRoomId(newRoomId);
    localStorage.setItem('roomId', newRoomId);
    socket.emit('joinRoom', { roomId: newRoomId });
  };

  const getRoomIdForContact = (contactId) => {
    if (!currentUserId) return '';
    const sortedIds = [currentUserId, contactId].sort();
    return sortedIds.join('-');
  };

  return (
    <div className="sidebar">
      <h2>Chats</h2>
      <div className="contacts-list">
        {users.length > 0 ? (
          users.map((user) => {
            const contactRoomId = getRoomIdForContact(user._id);
            const isActive = roomId === contactRoomId;
            return (
              <div
                key={user._id}
                className={isActive ? 'contact-item active' : 'contact-item'}
                onClick={() => handleChatSelect(user._id)}
              >
                {user.username}
              </div>
            );
          })
        ) : (
          <p>No contacts available</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;