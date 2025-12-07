import React, { useState, useEffect, useRef } from 'react';
import { useReality, REALITIES } from '../context/RealityContext';
import { Terminal } from 'lucide-react';

const RealityPrompt = () => {
    const { executeCommand, reality } = useReality();
    const [input, setInput] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsVisible(prev => !prev);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') setIsVisible(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        executeCommand(input);
        setInput('');
        setIsVisible(false);
    };

    if (!isVisible && reality === REALITIES.DEFAULT) return (
        <div style={styles.hint} onClick={() => setIsVisible(true)}>
            <Terminal size={16} />
            <span className="mono">CMD+K TO GENERATE</span>
        </div>
    );

    if (!isVisible && reality !== REALITIES.DEFAULT) return null; // Hide hint in other modes

    return (
        <div style={styles.overlay} onClick={() => setIsVisible(false)}>
            <div style={styles.dialog} onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div style={styles.promptLine}>
                        <span style={styles.chevron}>&gt;</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Enter command (e.g. 'chaos', 'zen', 'reset')..."
                            style={styles.input}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    hint: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#000',
        color: '#fff',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: 1000,
        fontSize: '0.8rem',
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
    },
    dialog: {
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#000',
        padding: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    },
    promptLine: {
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
    },
    chevron: {
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '1.5rem',
    },
    input: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '1.5rem',
        outline: 'none',
    }
};

export default RealityPrompt;
