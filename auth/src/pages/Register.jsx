import { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:3001';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                // Registration successful
                console.log('Registration successful:', data);
                window.location.href = `${AUTH_URL}`; // Redirect to login page
            } else {
                // Registration failed
                console.error('Registration failed:', data);
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    }

    return (
        <div
            style={{
                height: '100vh',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <h1>Register</h1>
            <form
                style={{
                    margin: '5rem auto',
                    maxWidth: '600px'
                }}
                onSubmit={handleSubmit}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                    }}
                >
                    <label>Username:</label>
                    <input
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            padding: '10px 15px',
                            marginTop: '8px',
                            borderRadius: '10px',
                            border: '1px solid #010101',
                            outline: 'none',
                            fontSize: '16px'
                        }}
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                    }}
                >
                    <label>Email:</label>
                    <input
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            padding: '10px 15px',
                            marginTop: '8px',
                            borderRadius: '10px',
                            border: '1px solid #010101',
                            outline: 'none',
                            fontSize: '16px'
                        }}
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                    }}
                >
                    <label>Password:</label>
                    <input
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            padding: '10px 15px',
                            marginTop: '8px',
                            borderRadius: '10px',
                            border: '1px solid #010101',
                            outline: 'none',
                            fontSize: '16px'
                        }}
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>
                <button
                    style={{
                        // width: '100%',
                        padding: '10px 15px',
                        marginTop: '8px',
                        borderRadius: '10px',
                        border: '1px solid #010101',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                    type="submit">Register</button>
            </form>
        </div>
    )
}

