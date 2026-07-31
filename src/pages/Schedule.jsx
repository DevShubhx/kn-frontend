import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
    const navigate = useNavigate()

    return (
        <div style={
            {
                minHeight: '100vh',
                minHeight: '100vh',
                margin: 0,
                padding: '20px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#333',
                color: 'white',
                fontFamily: 'sans-serif',
                justifyContent: 'center',
                alignItems: 'center'

            }
        }>
            <button
                onClick={() => navigate('/')}
                style={
                    {
                        backgroundColor: '#333',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginBottom: '20px',
                         fontSize: '2.5rem',
                        maxWidth: '90%',
                        lineHeight: '1.4',
                        textAlign: 'center'
                    }
                }
            >⬅ Back to Welcome Screen</button>

            <h2 style={
                {
                    fontSize: '2rem',
                    marginBottom: '20px'
                }
            }>Trending Content Catalog</h2>

            <p style={
                {
                    color: '#aaa'
                }
            }>Your backend show list grid will load and render beautifully right here next!</p>

        </div>
    )
}

export default Home