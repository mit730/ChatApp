import React, { useEffect, useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ socket, setRoomId, roomId }) => {
  const [users, setUsers] = useState([]);
  const currentUser = localStorage.getItem('userName');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/users/users', {
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
    fetchUsers();
  }, [currentUser]);

  const handleChatSelect = (contactUsername) => {
    const sortedUsernames = [currentUser, contactUsername].sort();
    const newRoomId = sortedUsernames.join('-');
    console.log("Setting roomId:", newRoomId);
    setRoomId(newRoomId);
    localStorage.setItem('roomId', newRoomId);
    socket.emit('joinRoom', { roomId: newRoomId });
  };

  const getRoomIdForContact = (contactUsername) => {
    const sortedUsernames = [currentUser, contactUsername].sort();
    return sortedUsernames.join('-');
  };

  return (
    <div className="sidebar">
      <h2>Chats</h2>
      <div className="contacts-list">
        {users.length > 0 ? (
          users.map((user) => {
            const contactRoomId = getRoomIdForContact(user.username);
            const isActive = roomId === contactRoomId;
            return (
              <div
                key={user._id}
                className={isActive ? 'contact-item active' : 'contact-item'}
                onClick={() => handleChatSelect(user.username)}
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