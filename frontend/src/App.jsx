import React, { useState, useEffect } from 'react';
import axios from 'axios';

const REMOTE_IP = '150.129.165.162';
const LOCAL_IP = 'localhost';

function App() {
    const [connectionMode, setConnectionMode] = useState('remote');
    const [inputText, setInputText] = useState('');
    const [dataList, setDataList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const activeIp = connectionMode === 'remote' ? REMOTE_IP : LOCAL_IP;
    const API_URL = `http://${activeIp}:5000/api/data`;

    const fetchData = async () => {
        try {
            const response = await axios.get(API_URL);
            setDataList(response.data || []);
        } catch (error) {
            console.error('Error:', error);
            setDataList([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, [connectionMode]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setIsLoading(true);
        try {
            await axios.post(API_URL, { content: inputText });
            setInputText('');
            fetchData();
        } catch (error) {
            alert('Error saving data');
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

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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
                            Remote Server ({REMOTE_IP})
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
