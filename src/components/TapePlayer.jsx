import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TapePlayer = ({ title, date, duration, description, audioSrc, isFocused, onTogglePlay }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    // Auto-expand if playing
    const isExpanded = isPlaying || isFocused;

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Playback failed", e));
        } else if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const togglePlay = (e) => {
        e.stopPropagation();
        const newState = !isPlaying;
        setIsPlaying(newState);
        if (onTogglePlay) onTogglePlay(newState);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} `;
    };

    return (
        <motion.div
            layout
            style={styles.container}
            className="art-border"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <motion.div layout style={styles.device}>
                <div style={styles.topTitle}>{title}</div>
                <div style={styles.header}>
                    <div style={styles.brand}>SNO-MAC</div>
                    <div style={styles.led} className={isPlaying ? 'active' : ''}></div>
                </div>

                {/* Audio Element */}
                {audioSrc && (
                    <audio
                        ref={audioRef}
                        src={audioSrc}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                    />
                )}

                {/* Cassette Well (Visuals) */}
                <div style={styles.cassetteWell}>
                    <div style={styles.spool}>
                        <Disc size={24} className={isPlaying ? "spin" : ""} color="#444" />
                    </div>
                    <div style={styles.labelArea}>
                        {/* Title moved to top */}
                    </div>
                    <div style={styles.spool}>
                        <Disc size={24} className={isPlaying ? "spin" : ""} color="#444" />
                    </div>
                </div>

                {/* Controls */}
                <div style={styles.controls}>
                    <div style={styles.time}>{formatTime(currentTime)} / {duration}</div>
                    <button
                        style={styles.playBtn}
                        onClick={togglePlay}
                    >
                        {isPlaying ? <Pause size={20} color="#222" /> : <Play size={20} color="#222" />}
                    </button>
                    <span className="mono" style={{ fontSize: '0.6rem' }}>{date}</span>
                </div>
            </motion.div>

            {/* Expanded Description Area */}
            <AnimatePresence>
                {isExpanded && description && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={styles.expansion}
                    >
                        <div style={styles.divider}></div>
                        <h4 style={styles.expTitle}>{title}</h4>
                        <p style={styles.expBody}>{description}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                .active {
                    background-color: #ff4444 !important;
                    box-shadow: 0 0 5px #ff4444;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
};

const styles = {
    container: {
        backgroundColor: '#eceae4', // Off-white plastic
        borderRadius: '4px',
        overflow: 'hidden',
        width: '300px',
    },
    device: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    topTitle: {
        fontFamily: 'var(--font-typewriter)',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '12px',
        color: '#222',
    },
    brand: {
        fontFamily: 'var(--font-display)',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: '#aaa',
        letterSpacing: '0.1em',
    },
    led: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#ccadad', // Dim red
    },
    cassetteWell: {
        backgroundColor: '#2b2b2b',
        borderRadius: '4px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        color: '#fff',
    },
    labelArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    },
    trackTitle: {
        fontSize: '0.6rem',
        color: '#fff',
        marginBottom: '4px',
        maxWidth: '120px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    counter: {
        fontFamily: 'monospace',
        color: '#00ff00', // Green LED counter vibe
        fontSize: '0.9rem',
    },
    spool: {
        opacity: 0.8,
    },
    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    btn: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '2px solid #ccc',
        backgroundColor: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    expansion: {
        padding: '0 24px 24px 24px',
        backgroundColor: '#f8f6f1', // Slightly lighter for the note area
    },
    divider: {
        width: '100%',
        height: '1px',
        backgroundColor: '#ddd',
        marginBottom: '16px',
    },
    expTitle: {
        fontFamily: 'var(--font-sans)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        marginBottom: '8px',
        color: 'var(--color-text-muted)',
    },
    expBody: {
        fontFamily: 'var(--font-typewriter)',
        fontSize: '0.85rem',
        lineHeight: '1.4',
        color: '#444',
    }
};

export default TapePlayer;
