// import React, { useEffect, useState } from 'react';
// import VideoCall from './VideoCall';
// // import './ChatHeader.css';

// const ChatHeader = ({ socket, roomId, setSearchResults }) => {
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [otherUser, setOtherUser] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchType, setSearchType] = useState('');
//   const [searchDate, setSearchDate] = useState('');
//   const [isSearchActive, setIsSearchActive] = useState(false);
//   const [showVideoCall, setShowVideoCall] = useState(false);

//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/me`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });
//         if (!response.ok) {
//           throw new Error('Failed to fetch current user');
//         }
//         const data = await response.json();
//         console.log("Current user:", data);
//         setCurrentUserId(data._id);
//       } catch (error) {
//         console.error('Error fetching current user:', error);
//       }
//     };

//     fetchCurrentUser();
//   }, []);

//   useEffect(() => {
//     if (!roomId || !currentUserId) return;

//     console.log("Current roomId:", roomId);
//     const [id1, id2] = roomId.split('-');
//     const otherUserId = currentUserId === id1 ? id2 : id1;
//     console.log("Extracted otherUserId:", otherUserId);

//     const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(otherUserId);
//     if (!isValidObjectId) {
//       console.error('Invalid otherUserId:', otherUserId);
//       setOtherUser({ username: 'Unknown User' });
//       return;
//     }

//     const fetchOtherUser = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/${otherUserId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });
//         if (!response.ok) {
//           throw new Error('Failed to fetch other user');
//         }
//         const data = await response.json();
//         console.log("Fetched other user:", data);
//         setOtherUser(data);
//       } catch (error) {
//         console.error('Error fetching other user:', error);
//         setOtherUser({ username: 'Unknown User' });
//       }
//     };

//     fetchOtherUser();
//   }, [roomId, currentUserId]);

//   const handleSearch = async () => {
//     if (!searchQuery && !searchType && !searchDate) {
//       setSearchResults(null);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const queryParams = new URLSearchParams({
//         roomId,
//         ...(searchQuery && { query: searchQuery }),
//         ...(searchType && { type: searchType }),
//         ...(searchDate && { date: searchDate }),
//       });
//       const response = await fetch(`${process.env.REACT_APP_BASE_URL}/chat/search?${queryParams}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });
//       const data = await response.json();
//       setSearchResults(data.messages || []);
//     } catch (error) {
//       console.error('Error searching messages:', error);
//       setSearchResults([]);
//     }
//   };

//   useEffect(() => {
//     if (isSearchActive) {
//       handleSearch();
//     }
//   }, [searchQuery, searchType, searchDate, isSearchActive]);

//   const toggleSearch = () => {
//     setIsSearchActive(!isSearchActive);
//     if (!isSearchActive) {
//       setSearchQuery('');
//       setSearchType('');
//       setSearchDate('');
//       setSearchResults(null);
//     }
//   };

//   return (
//     <div className="chat-header">
//       <div className="chat-header-info">
//         <h3>{otherUser ? otherUser.username : 'Loading...'}</h3>
//         <p>{otherUser ? 'Online' : ''}</p>
//       </div>
//       <div className="chat-header-actions">
//         <button onClick={toggleSearch}>
//           {isSearchActive ? 'Close' : 'Search'}
//         </button>
//         <button onClick={() => setShowVideoCall(true)} className="video-call-button">
//           Video Call
//         </button>
//       </div>
//       {isSearchActive && (
//         <div className="search-bar">
//           <input
//             type="text"
//             placeholder="Search messages..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           <select
//             value={searchType}
//             onChange={(e) => setSearchType(e.target.value)}
//           >
//             <option value="">All Types</option>
//             <option value="text">Text</option>
//             <option value="media">Media</option>
//           </select>
//           <input
//             type="date"
//             value={searchDate}
//             onChange={(e) => setSearchDate(e.target.value)}
//           />
//         </div>
//       )}
//       {showVideoCall && (
//         <VideoCall
//           socket={socket}
//           roomId={roomId}
//           onClose={() => setShowVideoCall(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default ChatHeader;

import React, { useState } from 'react';
import VideoCall from './VideoCall';


const ChatHeader = ({ socket, roomId, setSearchResults, incomingCall, setIncomingCall, acceptorPeerId }) => {
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const handleStartVideoCall = () => {
    console.log('Starting video call for room:', roomId);
    setIsVideoCallActive(true);
  };

  const handleCloseVideoCall = () => {
    console.log('Closing video call');
    setIsVideoCallActive(false);
    setIncomingCall(null);
  };

  return (
    <div className="chat-header">
      <h2>Chat</h2>
      <button onClick={handleStartVideoCall}>Start Video Call</button>
      {isVideoCallActive && (
        <VideoCall
          socket={socket}
          roomId={roomId}
          onClose={handleCloseVideoCall}
          incomingCall={incomingCall}
          setIncomingCall={setIncomingCall}
          acceptorPeerId={acceptorPeerId}
        />
      )}
    </div>
  );
};

export default ChatHeader;