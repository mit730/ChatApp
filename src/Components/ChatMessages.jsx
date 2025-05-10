import React, { useEffect, useRef } from 'react';

const ChatMessages = ({ messageData }) => {

  const messageEndRef = useRef(null)

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behaviour: "smooth" })
    }
  }, [messageData])

  return (
    <div className="chat-messages1">
      <div className="message__container">
        {messageData.map((message) =>
          message.name === localStorage.getItem('userName') ? (
            <div className="message__chats" key={message.id}>
              <p className="sender__name">You</p>
              <div className="message__sender">
                <p>{message.text}</p>
              </div>
            </div>
          ) : (
            <div className="message__chats" key={message.id}>
              <p>{message.name}</p>
              <div className="message__recipient">
                <p>{message.text}</p>
              </div>
            </div>
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
