class Login {
    constructor() {
        this.form = $('#loginForm');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.submit((e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const loginData = {
            username: $('#username').val(),
            password: $('#password').val()
        };
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = '/chat-room';
            } else {
            alert(data.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    }
}

$(document).ready(() => {
    new Login();
});