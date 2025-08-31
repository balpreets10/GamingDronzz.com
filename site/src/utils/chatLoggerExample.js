import ChatLogger from './chatLogger.js';

// Example usage of the ChatLogger
const logger = new ChatLogger();

// Example: Log a complete chat conversation
function exampleLogChat() {
  const context = "React Component Development";
  const messages = [
    {
      role: "user",
      content: "Can you help me create a new React component for displaying game cards?",
      timestamp: new Date().toLocaleString()
    },
    {
      role: "assistant", 
      content: "I'll help you create a GameCard component. Let me start by examining your existing components to follow the same patterns...",
      timestamp: new Date().toLocaleString()
    },
    {
      role: "user",
      content: "Make sure it follows BEM methodology for CSS classes.",
      timestamp: new Date().toLocaleString()
    }
  ];

  const savedFile = logger.logChat(context, messages);
  console.log(`Chat logged to: ${savedFile}`);
  return savedFile;
}

// Example: Append to existing chat
function exampleAppendChat(filename) {
  const newMessage = {
    role: "assistant",
    content: "I've created the GameCard component following BEM methodology. The component includes proper TypeScript types and responsive design.",
    timestamp: new Date().toLocaleString()
  };

  const updatedFile = logger.appendToChat(filename, newMessage);
  console.log(`Message appended to: ${updatedFile}`);
}

// Example: List all chats
function exampleListChats() {
  const chats = logger.listChats();
  console.log('Available chat logs:');
  chats.forEach(chat => {
    console.log(`- ${chat.filename} (${chat.context}) - Modified: ${chat.modified}`);
  });
  return chats;
}

// Run examples
console.log('=== Chat Logger Examples ===\n');

// Log a new chat
const savedFile = exampleLogChat();

// Extract filename for append example
const filename = savedFile.split('\\').pop();

// Append a message
setTimeout(() => {
  exampleAppendChat(filename);
  
  // List all chats
  setTimeout(() => {
    exampleListChats();
  }, 100);
}, 100);

export { exampleLogChat, exampleAppendChat, exampleListChats };