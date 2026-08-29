function MessageInput({ input, setInput, onSend }) {
  
 const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSend();
    }
  };
  
  
    return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button onClick={onSend}>
        Send
      </button>
    </div>
  );
}

export default MessageInput;