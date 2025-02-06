class ChatRoom {
    constructor() {
        this.socket = io();
        this.currentRoom = '';
        this.typingTimeout = null;
        this.user = JSON.parse(localStorage.getItem('user'));
        
        if (!this.user) {
            window.location.href = '/login';
            return;
        }
        this.initializeUI();
        this.setupEventListeners();
        this.setupSocketListeners();
    }

    initializeUI() {

        $('#userInfo').html(`
            <div class="text-center mb-3">
                <h6>Welcome, ${this.user.firstname} ${this.user.lastname}</h6>
                <small class="text-muted">@${this.user.username}</small>
            </div>
        `);
        this.fetchRooms();
    }

    fetchRooms() {
        fetch('/api/rooms')
            .then(response => response.json())
            .then(rooms => {
                const roomList = $('#roomList');
                rooms.forEach(room => {
                    roomList.append(`
                        <div class="card room-card mb-2" data-room="${room}">
                            <div class="card-body">
                                <h6 class="card-title mb-0">${room}</h6>
                            </div>
                        </div>
                    `);
                });
            });
    }

    setupEventListeners() {

        $(document).on('click', '.room-card', (e) => this.handleRoomJoin(e));
        $('#messageForm').submit((e) => this.handleMessageSubmit(e));
        $('#messageInput').on('input', () => this.handleTyping());
        $('#logoutBtn').click(() => this.handleLogout());

    }

    setupSocketListeners() {
        this.socket.on('chat message', (data) => this.addMessage(data));
        this.socket.on('user typing', (username) => {
            $('#typingIndicator').text(
                username ? `${username} is typing...` : ''
            );
        });
        this.socket.on('user joined', (message) => this.appendSystemMessage(message));
        this.socket.on('user left', (message) => this.appendSystemMessage(message));
    }

    handleRoomJoin(e) {
        const newRoom = $(e.currentTarget).data('room');
        
        if (this.currentRoom) {
            this.socket.emit('leave room', this.currentRoom);
        }
        
        this.currentRoom = newRoom;
        this.socket.emit('join room', this.currentRoom);

        $('.room-card').removeClass('room-active');
        $(e.currentTarget).addClass('room-active');
        $('#currentRoomTitle').text(`Room: ${this.currentRoom}`);
        $('#messages').empty();
        $('#messageInput').prop('disabled', false);
        $('button[type="submit"]').prop('disabled', false);
        this.loadPreviousMessages();
    }

    loadPreviousMessages() {
        fetch(`/api/messages/${this.currentRoom}`)
            .then(response => response.json())
            .then(messages => {
                messages.forEach(msg => this.addMessage(msg));
            })
            .catch(error => console.error('Error loading messages:', error));
    }

    handleMessageSubmit(e) {
            e.preventDefault();
        
    const messageInput = $('#messageInput');
        const message = messageInput.val().trim();
        
        if (message && this.currentRoom) {
            this.socket.emit('chat message', {
                room: this.currentRoom,
                message: message,
                username: this.user.username
            });
            messageInput.val('');
        }
    }

    handleTyping() {
        clearTimeout(this.typingTimeout);
        
        if (this.currentRoom) {
            this.socket.emit('typing', {
                room: this.currentRoom,
                username: this.user.username
            });
            
            this.typingTimeout = setTimeout(() => {
                this.socket.emit('typing', {
                    room: this.currentRoom,
                    username: ''
                });
            }, 1000);
        }
    }

    handleLogout() {
        if (this.currentRoom) {
        this.socket.emit('leave room', this.currentRoom);
        }
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    addMessage(data) {
        const isOwnMessage = data.username === this.user.username;
            const messageClass = isOwnMessage ? 'message-sent' : 'message-received';
        
        $('#messages').append(`
            <div class="message ${messageClass}">
                <div class="message-header">
                    <strong>${data.username}</strong>
                    <small class="text-muted">
                        ${new Date(data.timestamp).toLocaleTimeString()}
                    </small>
                </div>
                <div class="message-content">${data.message}</div>
            </div>
        `);
        this.scrollToBottom();
    }

    appendSystemMessage(message) {
        $('#messages').append(`
            <div class="text-center text-muted small my-2">${message}</div>
        `);
        this.scrollToBottom();
    }
    scrollToBottom() {
        const messages = $('#messages');
    messages.scrollTop(messages[0].scrollHeight);
    }
}
$(document).ready(() => {
    new ChatRoom();
});