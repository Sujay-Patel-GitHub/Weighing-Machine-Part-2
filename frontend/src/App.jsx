import React, { useState, useEffect } from 'react';
import axios from 'axios';

const REMOTE_IP = import.meta.env.VITE_SERVER_IP || '150.129.165.162';
const LOCAL_IP = 'localhost';

function App() {
    const [connectionMode, setConnectionMode] = useState('remote');
    const [inputText, setInputText] = useState('');
    const [dataList, setDataList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [customIp, setCustomIp] = useState(localStorage.getItem('saved_ip') || REMOTE_IP);

    const activeIp = connectionMode === 'remote' ? customIp : LOCAL_IP;

    // Ensure the URL has a protocol. If the user is on HTTPS (Netlify), 
    // they might need to use HTTPS for their server too, or a proxy.
    const getApiUrl = () => {
        const protocol = (customIp.startsWith('http') || connectionMode === 'local') ? '' : 'http://';
        const port = activeIp.includes(':') ? '' : ':5000';
        return `${protocol}${activeIp}${port}/api/data`;
    };

    const API_URL = getApiUrl();

    const fetchData = async () => {
        try {
            const response = await axios.get(API_URL, { timeout: 5000 });
            setDataList(response.data || []);
        } catch (error) {
            console.error('Fetch error:', error);
            setDataList([]);
        }
    };

    useEffect(() => {
        localStorage.setItem('saved_ip', customIp);
        fetchData();
    }, [connectionMode, customIp]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setIsLoading(true);
        try {
            await axios.post(API_URL, { content: inputText });
            setInputText('');
            fetchData();
        } catch (error) {
            console.error('Save error:', error);
            alert(`Error saving data: ${error.message}\n\nNote: If you are on HTTPS (Netlify), your browser might block calls to an HTTP server (Mixed Content). Try using a direct IP without HTTPS or use a proxy.`);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            color: 'white',
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
                        MongoBridge Dashboard
                    </h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setConnectionMode('remote')}
                                style={{
                                    padding: '10px 20px',
                                    background: connectionMode === 'remote' ? '#6366f1' : '#1e293b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Remote Server
                            </button>
                            <button
                                onClick={() => setConnectionMode('local')}
                                style={{
                                    padding: '10px 20px',
                                    background: connectionMode === 'local' ? '#6366f1' : '#1e293b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Local Server
                            </button>
                        </div>

                        {connectionMode === 'remote' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '14px', color: '#64748b' }}>Server IP/URL:</span>
                                <input
                                    type="text"
                                    value={customIp}
                                    onChange={(e) => setCustomIp(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '6px',
                                        color: 'white',
                                        width: '200px'
                                    }}
                                    placeholder="e.g. 150.129.165.162"
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                        Target API: <code style={{ color: '#818cf8' }}>{API_URL}</code>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                    {/* Input Section */}
                    <div style={{
                        background: '#1e293b',
                        padding: '30px',
                        borderRadius: '16px',
                        border: '1px solid #334155'
                    }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Add New Data</h2>
                        <form onSubmit={handleSave}>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Enter text to save..."
                                style={{
                                    width: '100%',
                                    minHeight: '200px',
                                    padding: '15px',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '16px',
                                    marginBottom: '15px',
                                    resize: 'vertical'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputText.trim()}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    background: isLoading ? '#475569' : '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: isLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoading ? 'Saving...' : 'Save to MongoDB'}
                            </button>
                        </form>
                    </div>

                    {/* Data Viewer */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px' }}>Stored Data ({dataList.length})</h2>
                            <button
                                onClick={fetchData}
                                style={{
                                    padding: '10px 20px',
                                    background: '#1e293b',
                                    color: 'white',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Refresh
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {dataList.length === 0 ? (
                                <div style={{
                                    padding: '60px',
                                    textAlign: 'center',
                                    background: '#1e293b',
                                    borderRadius: '16px',
                                    border: '2px dashed #334155',
                                    color: '#64748b'
                                }}>
                                    No data found in database
                                </div>
                            ) : (
                                dataList.map((item) => (
                                    <div
                                        key={item._id}
                                        style={{
                                            background: '#1e293b',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: '1px solid #334155',
                                            position: 'relative'
                                        }}
                                    >
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            style={{
                                                position: 'absolute',
                                                top: '15px',
                                                right: '15px',
                                                background: '#dc2626',
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Delete
                                        </button>
                                        <p style={{
                                            fontSize: '16px',
                                            lineHeight: '1.6',
                                            marginBottom: '15px',
                                            paddingRight: '80px'
                                        }}>
                                            {item.content}
                                        </p>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#64748b',
                                            borderTop: '1px solid #334155',
                                            paddingTop: '10px'
                                        }}>
                                            {new Date(item.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
