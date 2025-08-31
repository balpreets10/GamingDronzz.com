#!/usr/bin/env node
import ChatLogger from './chatLogger.js';
import readline from 'readline';

const logger = new ChatLogger();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('=== Chat Logger CLI ===\n');
  console.log('1. Log new chat');
  console.log('2. List all chats');
  console.log('3. Exit');
  
  const choice = await askQuestion('\nSelect option (1-3): ');
  
  switch (choice) {
    case '1':
      await logNewChat();
      break;
    case '2':
      listChats();
      break;
    case '3':
      console.log('Goodbye!');
      rl.close();
      return;
    default:
      console.log('Invalid option');
  }
  
  rl.close();
}

async function logNewChat() {
  const context = await askQuestion('Enter chat context/topic: ');
  const messages = [];
  
  console.log('\nEnter messages (type "done" to finish):');
  
  while (true) {
    const role = await askQuestion('Role (user/assistant): ');
    if (role.toLowerCase() === 'done') break;
    
    const content = await askQuestion('Message content: ');
    if (content.toLowerCase() === 'done') break;
    
    messages.push({
      role: role,
      content: content,
      timestamp: new Date().toLocaleString()
    });
    
    console.log('Message added. Continue adding or type "done".\n');
  }
  
  if (messages.length > 0) {
    const savedFile = logger.logChat(context, messages);
    console.log(`\nChat logged successfully to: ${savedFile}`);
  } else {
    console.log('No messages to log.');
  }
}

function listChats() {
  const chats = logger.listChats();
  
  if (chats.length === 0) {
    console.log('No chat logs found.');
    return;
  }
  
  console.log('\nAvailable chat logs:');
  chats.forEach((chat, index) => {
    console.log(`${index + 1}. ${chat.filename}`);
    console.log(`   Context: ${chat.context}`);
    console.log(`   Created: ${chat.created.toLocaleString()}`);
    console.log(`   Size: ${chat.size} bytes\n`);
  });
}

main().catch(console.error);