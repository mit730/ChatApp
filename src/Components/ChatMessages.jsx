import React, { useEffect, useRef } from 'react';
// import './ChatMessages.css';

const ChatMessages = ({ messageData, searchResults, searchQuery }) => {
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageData, searchResults]);

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  const messagesToDisplay = searchResults !== null ? searchResults : messageData;

  return (
    <div className="chat-messages1">
      <div className="message__container">
        {messagesToDisplay.length === 0 && searchResults !== null ? (
          <p>No results found</p>
        ) : (
          messagesToDisplay.map((message) =>
            message.name === localStorage.getItem('userName') ? (
              <div className="message__chats" key={message.id}>
                <p className="sender__name">You</p>
                <div className="message__sender">
                  {message.isMedia ? (
                    <img src={`${process.env.REACT_APP_IMG_URL}${message.mediaUrl}`} alt="Sent media" className="message-image" />
                  ) : (
                    <p>{highlightText(message.text, searchQuery)}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="message__chats" key={message.id}>
                <p>{message.name}</p>
                <div className="message__recipient">
                  {message.isMedia ? (
                  <img src={`${process.env.REACT_APP_IMG_URL}${message.mediaUrl}`} alt="" className="message-image" />
                  ) : (
                    <p>{highlightText(message.text, searchQuery)}</p>
                  )}
                </div>
              </div>
            )
          )
        )}
        <div ref={messageEndRef}>
          <div className="message__status">
            {/* <p>Someone is typing...</p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;