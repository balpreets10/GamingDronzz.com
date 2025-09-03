import fs from 'fs';
import path from 'path';

class ChatLogger {
  constructor() {
    this.chatsDir = path.join(process.cwd(), '../info/chats');
    this.ensureChatsDirectory();
  }

  ensureChatsDirectory() {
    if (!fs.existsSync(this.chatsDir)) {
      fs.mkdirSync(this.chatsDir, { recursive: true });
    }
  }

  formatDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
  }

  sanitizeFilename(context) {
    // Remove invalid filename characters and limit length
    return context
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      .toLowerCase();
  }

  logChat(context, messages) {
    const timestamp = this.formatDateTime();
    const sanitizedContext = this.sanitizeFilename(context);
    const filename = `${timestamp}-${sanitizedContext}.md`;
    const filepath = path.join(this.chatsDir, filename);

    let content = `# Chat Log: ${context}\n\n`;
    content += `**Date:** ${new Date().toLocaleString()}\n`;
    content += `**Context:** ${context}\n\n`;
    content += `---\n\n`;

    messages.forEach((message, index) => {
      content += `## Message ${index + 1}\n`;
      content += `**Role:** ${message.role}\n`;
      content += `**Timestamp:** ${message.timestamp || new Date().toLocaleString()}\n\n`;
      content += `${message.content}\n\n`;
      content += `---\n\n`;
    });

    fs.writeFileSync(filepath, content, 'utf8');
    return filepath;
  }

  appendToChat(filename, message) {
    const filepath = path.join(this.chatsDir, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Chat file ${filename} does not exist`);
    }

    let appendContent = `## Message (Added ${new Date().toLocaleString()})\n`;
    appendContent += `**Role:** ${message.role}\n`;
    appendContent += `**Timestamp:** ${message.timestamp || new Date().toLocaleString()}\n\n`;
    appendContent += `${message.content}\n\n`;
    appendContent += `---\n\n`;

    fs.appendFileSync(filepath, appendContent, 'utf8');
    return filepath;
  }

  listChats() {
    const files = fs.readdirSync(this.chatsDir)
      .filter(file => file.endsWith('.md'))
      .sort((a, b) => b.localeCompare(a)); // Most recent first

    return files.map(filename => {
      const filepath = path.join(this.chatsDir, filename);
      const stats = fs.statSync(filepath);
      const [dateTime, ...contextParts] = filename.replace('.md', '').split('-');
      
      return {
        filename,
        context: contextParts.join('-'),
        created: stats.birthtime,
        modified: stats.mtime,
        size: stats.size
      };
    });
  }
}

export default ChatLogger;