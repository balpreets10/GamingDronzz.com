/**
 * AI Chat Widget - Bottom-right chat box implementation
 */
class ChatWidget {
    constructor() {
        this.isInitialized = false;
        this.isOpen = false;
        this.chatContainer = null;
        this.messages = [];
        this.contentMapper = null;
        this.isProcessing = false;
        this.preventAutoClose = false;
        this.tooltipDismissed = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.waitForContentMapper();
        this.createFloatingButton();
        this.createChatContainer();
        this.createTooltip();
        this.isInitialized = true;
        console.log('ChatWidget initialized');
    }

    async waitForContentMapper() {
        const checkMapper = () => {
            if (window.contentMapper && window.contentMapper.contentMap) {
                this.contentMapper = window.contentMapper;
                console.log('ContentMapper connected to ChatWidget');
            } else {
                setTimeout(checkMapper, 100);
            }
        };
        checkMapper();
    }

    createFloatingButton() {
        const existingBtn = document.getElementById('chat-widget-btn');
        if (existingBtn) {
            existingBtn.remove();
        }

        const floatingBtn = document.createElement('button');
        floatingBtn.id = 'chat-widget-btn';
        floatingBtn.className = 'chat-widget-floating-btn';
        floatingBtn.innerHTML = `<i class="fas fa-robot"></i>`;

        floatingBtn.addEventListener('click', () => this.toggleChat());
        document.body.appendChild(floatingBtn);
    }

    createTooltip() {
        const existingTooltip = document.getElementById('chat-widget-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.id = 'chat-widget-tooltip';
        tooltip.className = 'chat-widget-tooltip';
        tooltip.innerHTML = `
            <div class="chat-widget-tooltip-content">
                <div class="chat-widget-tooltip-icon">
                    🤖
                </div>
                <div class="chat-widget-tooltip-text">
                    <strong>AI Navigation Assistant</strong><br>
                    Ask me to navigate anywhere on this portfolio!
                </div>
                <button class="chat-widget-tooltip-close" id="tooltip-close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add as sibling to body, not child of button
        document.body.appendChild(tooltip);
        this.tooltip = tooltip;

        // Setup close button
        const closeBtn = tooltip.querySelector('#tooltip-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dismissTooltip();
            });
        }

        // Show tooltip after 2 seconds
        setTimeout(() => {
            if (!this.tooltipDismissed && !this.isOpen) {
                this.showTooltip();
            }
        }, 2000);

        // Auto-hide after 8 seconds of showing
        setTimeout(() => {
            if (!this.tooltipDismissed && this.tooltip) {
                this.hideTooltip();
            }
        }, 10000);
    }

    showTooltip() {
        if (!this.tooltip || this.tooltipDismissed || this.isOpen) return;

        this.tooltip.classList.add('show');
        console.log('AI Navigation tooltip shown');
    }

    hideTooltip() {
        if (!this.tooltip) return;

        this.tooltip.classList.remove('show');
    }

    dismissTooltip() {
        this.tooltipDismissed = true;
        this.hideTooltip();
        console.log('AI Navigation tooltip dismissed');
    }

    createChatContainer() {
        const existingContainer = document.getElementById('chat-widget-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-widget-container';
        chatContainer.className = 'chat-widget-container';
        chatContainer.innerHTML = this.createChatHTML();

        document.body.appendChild(chatContainer);
        this.chatContainer = chatContainer;

        setTimeout(() => this.setupEventListeners(), 100);
    }

    createChatHTML() {
        return `
            <div class="chat-widget-header">
                <div class="chat-widget-title">
                    <i class="fas fa-robot"></i>
                    AI Assistant
                </div>
                <button class="chat-widget-close" id="chat-close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="chat-interface">
                <div class="chat-messages" id="chat-messages">
                    <div class="chat-message ai">
                        <strong>🤖 AI:</strong> Hi! I can help you navigate this portfolio. Try asking about projects, skills, or experience!
                    </div>
                </div>
                
                <div class="chat-examples">
                    <div class="chat-example" data-example="Show me Unity projects">
                        🎮 "Show me Unity projects"
                    </div>
                    <div class="chat-example" data-example="What are your programming skills?">
                        💻 "What are your programming skills?"
                    </div>
                    <div class="chat-example" data-example="Tell me about your experience">
                        📋 "Tell me about your experience"
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <input type="text" id="chat-input" class="chat-input" 
                           placeholder="Ask me anything about the portfolio..." maxlength="500">
                    <button id="chat-send-btn" class="chat-send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const closeBtn = document.getElementById('chat-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideChat());
        }

        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');

        if (chatInput && sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());

            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            chatInput.addEventListener('focus', () => {
                this.preventAutoClose = true;
            });

            chatInput.addEventListener('blur', () => {
                setTimeout(() => {
                    this.preventAutoClose = false;
                }, 200);
            });
        }

        const examples = document.querySelectorAll('.chat-example');
        examples.forEach(example => {
            example.addEventListener('click', () => {
                const text = example.dataset.example;
                if (chatInput) {
                    chatInput.value = text;
                    this.sendMessage();
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.isProcessing &&
                !this.preventAutoClose &&
                !this.chatContainer.contains(e.target) &&
                !document.getElementById('chat-widget-btn').contains(e.target)) {

                const isClickOnChatElement = e.target.closest('.chat-widget-container') ||
                    e.target.closest('.chat-widget-floating-btn') ||
                    e.target.closest('.chat-widget-tooltip') ||
                    e.target.classList.contains('chat-example');

                if (!isClickOnChatElement) {
                    this.hideChat();
                }
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.hideChat();
        } else {
            this.showChat();
        }
    }

    showChat() {
        if (!this.chatContainer) return;

        this.isOpen = true;
        this.chatContainer.classList.add('show');

        // Hide tooltip when chat opens
        if (this.tooltip) {
            this.hideTooltip();
        }

        const floatingBtn = document.getElementById('chat-widget-btn');
        if (floatingBtn) {
            floatingBtn.classList.add('active');
        }

        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.focus();
            }
        }, 300);
    }

    hideChat() {
        if (!this.chatContainer) return;

        this.isOpen = false;
        this.chatContainer.classList.remove('show');

        const floatingBtn = document.getElementById('chat-widget-btn');
        if (floatingBtn) {
            floatingBtn.classList.remove('active');
        }
    }

    async sendMessage() {
        if (this.isProcessing) return;

        const chatInput = document.getElementById('chat-input');
        const messagesContainer = document.getElementById('chat-messages');

        if (!chatInput || !messagesContainer) return;

        const message = chatInput.value.trim();
        if (!message) return;

        this.isProcessing = true;
        this.preventAutoClose = true;

        this.addMessage('user', message);
        chatInput.value = '';

        const sendBtn = document.getElementById('chat-send-btn');
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        try {
            await this.processMessage(message);
        } catch (error) {
            console.error('Error processing message:', error);
            this.addMessage('ai', "Sorry, I encountered an error. Please try again or ask about projects, skills, or experience.");
        } finally {
            this.isProcessing = false;
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            }

            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.focus();
            }
        }
    }

    async processMessage(message) {
        if (!this.contentMapper) {
            this.addMessage('ai', "I'm still loading. Please wait a moment and try again.");
            return;
        }

        this.showTypingIndicator();

        try {
            const intent = this.contentMapper.processQuery(message);
            this.removeTypingIndicator();
            this.addMessage('ai', intent.response);

            if (intent.actions && intent.actions.length > 0) {
                const success = await this.executeActionChain(intent);

                if (success) {
                    setTimeout(() => {
                        const confirmationMessage = this.getActionChainConfirmation(intent);
                        this.addMessage('ai', confirmationMessage);
                    }, this.calculateActionChainDelay(intent.actions));
                } else {
                    this.addMessage('ai', "I had trouble with that action. Could you try rephrasing your request?");
                }
            }
        } catch (error) {
            console.error('Error in processMessage:', error);
            this.removeTypingIndicator();
            this.addMessage('ai', "I didn't understand that. Try asking about projects, skills, experience, or contact information!");
        }
    }

    async executeActionChain(intent) {
        try {
            if (intent.actions.length > 1) {
                this.showActionProgress(intent.actions.length);
            }

            const success = await this.contentMapper.executeAction(intent);
            this.hideActionProgress();
            return success;
        } catch (error) {
            console.error('Error executing action chain:', error);
            this.hideActionProgress();
            return false;
        }
    }

    showActionProgress(actionCount) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const progressDiv = document.createElement('div');
        progressDiv.className = 'chat-message ai action-progress';
        progressDiv.id = 'action-progress';
        progressDiv.innerHTML = `
            <strong>🤖 AI:</strong> 
            <span class="action-status">
                Executing ${actionCount} actions...
                <div class="action-progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </span>
        `;

        messagesContainer.appendChild(progressDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideActionProgress() {
        const progressIndicator = document.getElementById('action-progress');
        if (progressIndicator) {
            progressIndicator.remove();
        }
    }

    calculateActionChainDelay(actions) {
        let totalDelay = 500;
        actions.forEach(action => {
            if (action.delay) {
                totalDelay += action.delay;
            }
            totalDelay += 300;
        });
        return Math.min(totalDelay, 3000);
    }

    getActionChainConfirmation(intent) {
        const actionTypes = intent.actions.map(action => action.type);

        if (actionTypes.includes('filter_portfolio') && actionTypes.includes('open_random_project')) {
            return `✅ Filtered projects and opened a random ${intent.actions.find(a => a.category)?.category} project!`;
        }

        if (actionTypes.includes('scroll_to_section') && actionTypes.includes('filter_portfolio')) {
            const category = intent.actions.find(a => a.category)?.category;
            return `✅ Navigated to portfolio and filtered ${category} projects!`;
        }

        if (actionTypes.includes('scroll_to_section') && actionTypes.includes('open_skills_modal')) {
            return `✅ Navigated to skills section and opened detailed information!`;
        }

        if (actionTypes.includes('scroll_to_section')) {
            const target = intent.actions.find(a => a.target)?.target;
            return `✅ Scrolled to the ${target} section!`;
        }

        return `✅ Actions completed successfully!`;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message ai typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <strong>🤖 AI:</strong> 
            <span class="typing-dots">
                <span></span><span></span><span></span>
            </span>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    addMessage(type, text) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;

        const sender = type === 'ai' ? '🤖 AI' : '👤 You';
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.messages.push({ type, text, timestamp: Date.now() });
    }

    // Public API methods
    show() { this.showChat(); }
    hide() { this.hideChat(); }
    getMessages() { return this.messages; }
    isVisible() { return this.isOpen; }

    clearMessages() {
        this.messages = [];
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="chat-message ai">
                    <strong>🤖 AI:</strong> Chat cleared! How can I help you navigate the portfolio?
                </div>
            `;
        }
    }
}

window.ChatWidget = ChatWidget;