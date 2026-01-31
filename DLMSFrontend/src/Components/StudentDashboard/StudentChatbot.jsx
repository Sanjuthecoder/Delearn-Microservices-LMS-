import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    Avatar,
    Fab,
    Fade,
    CircularProgress,
    useTheme
} from '@mui/material';
import {
    Send as SendIcon,
    Close as CloseIcon,
    SmartToy as BotIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import api from '../../Service/api';

const Chatbot = () => {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I am your AI Assistant. How can I help you with your courses today?",
            sender: 'bot'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/api/chat', { message: userMessage.text });
            const botMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "I apologize, but I'm having trouble connecting to the server right now. Please try again later.",
                sender: 'bot',
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <Fab
                color="primary"
                aria-label="chat"
                onClick={() => setIsOpen(!isOpen)}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 9999,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    }
                }}
            >
                {isOpen ? <CloseIcon /> : <BotIcon />}
            </Fab>

            {/* Chat Window */}
            <Fade in={isOpen}>
                <Paper
                    elevation={12}
                    sx={{
                        position: 'fixed',
                        bottom: 100,
                        right: 24,
                        width: { xs: '90%', sm: 350 },
                        height: 500,
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        bgcolor: 'background.paper'
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                        }}
                    >
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                            <BotIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Shri at HelpDesk
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                                Online • Powered by AI
                            </Typography>
                        </Box>
                    </Box>

                    {/* Messages Area */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            p: 2,
                            overflowY: 'auto',
                            bgcolor: '#f4f6f8',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {messages.map((msg) => (
                            <Box
                                key={msg.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    gap: 1
                                }}
                            >
                                {msg.sender === 'bot' && (
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#667eea', fontSize: '1rem' }}>
                                        <BotIcon fontSize="small" />
                                    </Avatar>
                                )}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        px: 2,
                                        maxWidth: '75%',
                                        borderRadius: 3,
                                        bgcolor: msg.isError ? '#ffeBee' : (msg.sender === 'user' ? '#667eea' : 'white'),
                                        color: msg.isError ? '#d32f2f' : (msg.sender === 'user' ? 'white' : 'text.primary'),
                                        borderTopLeftRadius: msg.sender === 'bot' ? 4 : 20,
                                        borderTopRightRadius: msg.sender === 'user' ? 4 : 20,
                                        boxShadow: msg.sender === 'bot' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {msg.text}
                                    </Typography>
                                </Paper>
                            </Box>
                        ))}

                        {isLoading && (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: '#667eea' }}>
                                    <BotIcon fontSize="small" />
                                </Avatar>
                                <Paper sx={{ p: 1.5, borderRadius: 3, bgcolor: 'white' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Box sx={{ width: 6, height: 6, bgcolor: '#ccc', borderRadius: '50%', animation: 'bounce 1s infinite 0s' }} />
                                        <Box sx={{ width: 6, height: 6, bgcolor: '#ccc', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                                        <Box sx={{ width: 6, height: 6, bgcolor: '#ccc', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
                                    </Box>
                                    <style>{`
                                        @keyframes bounce {
                                            0%, 100% { transform: translateY(0); }
                                            50% { transform: translateY(-4px); }
                                        }
                                    `}</style>
                                </Paper>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input Area */}
                    <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Type a message..."
                                size="small"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 4,
                                        bgcolor: '#f8f9fa'
                                    }
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                sx={{
                                    bgcolor: '#f0f4ff',
                                    '&:hover': { bgcolor: '#e0eaff' }
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: '#9ca3af', fontSize: '0.7rem' }}>
                            AI can make mistakes. Verify important info.
                        </Typography>
                    </Box>
                </Paper>
            </Fade>
        </>
    );
};

export default Chatbot;
