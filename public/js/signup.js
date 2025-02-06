class Signup {
    constructor() {
        this.form = $('#signupForm');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.submit((e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault(); 
        const signupData = {
            username: $('#username').val(),
            firstname: $('#firstname').val(),
            lastname: $('#lastname').val(),
            password: $('#password').val()
        };
        
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(signupData)
            });
            
            const data = await response.json();
            if (response.ok) {
                alert('Signup successful! Please login.');
                window.location.href = '/login';
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Signup failed. Please try again.');
        }
    }
}



$(document).ready(() => {
    new Signup();
});