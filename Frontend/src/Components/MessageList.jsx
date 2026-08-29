function MessageList({ messages }) {
  return (
    <div>
      {messages.map((message) => (
        <p key={message.text}>
          {message.sender}: {message.text}
        </p>
      ))}
    </div>
  );
}

export default MessageList;