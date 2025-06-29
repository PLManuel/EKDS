document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const response = await fetch('/api/auth/register', { 
        method: 'POST',
        body: new URLSearchParams(new FormData(e.target)),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 
        }
    }); ;

    const result = await response.json();

    if (response.ok) {
        alert(result.message);
    } else {
        alert(result.message);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const response = await fetch('/api/auth/login', { 
        method: 'POST',
        body: new URLSearchParams(new FormData(e.target)),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 
        }
    });    

    const result = await response.json();

    if (response.ok) {
        window.location.href = '/index.html';
    } else {
        alert(result.message);
    }
});


