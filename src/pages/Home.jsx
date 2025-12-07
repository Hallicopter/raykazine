import React, { useRef, useState } from 'react';
import DraggableArtifact from '../components/DraggableArtifact';
import PaperSheet from '../components/PaperSheet';
import TapePlayer from '../components/TapePlayer';
import ReaderModal from '../components/ReaderModal';
import { contentItems } from '../data/content';

const Home = ({ onNavigate }) => {
    const constraintsRef = useRef(null);
    const [focusedId, setFocusedId] = useState(null);
    const [readContent, setReadContent] = useState(null);

    // Track window size for responsive layout
    const [windowSize, setWindowSize] = useState({
        width: 1200,
        height: 800
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        // Set initial size on mount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFocus = (id) => {
        setFocusedId(id);
    };

    const handleRead = (content) => {
        setReadContent(content);
    };

    return (
        <main
            ref={constraintsRef}
            style={styles.workbench}
        >
            {contentItems.map((item, index) => {
                // Responsive Scaling
                // Padding ensures items don't stick to the very edge
                const padding = 80;
                const availableWidth = windowSize.width - (padding * 2);
                const availableHeight = windowSize.height - (padding * 2);

                const finalX = padding + (item.x * availableWidth);
                const finalY = padding + (item.y * availableHeight);

                return (
                    <DraggableArtifact
                        key={item.id}
                        id={item.id}
                        initialX={finalX}
                        initialY={finalY}
                        rotate={item.r}
                        baseZ={item.z}
                        isFocused={focusedId === item.id}
                        onFocus={handleFocus}
                    >
                        {item.type === 'ESSAY' && (
                            <PaperSheet
                                {...item.data}
                                type="ESSAY"
                                onRead={() => handleRead({ ...item.data, type: 'ESSAY' })}
                            />
                        )}
                        {item.type === 'TAPE' && (
                            <TapePlayer
                                {...item.data}
                                isFocused={focusedId === item.id}
                                onTogglePlay={(playing) => {
                                    if (playing) handleFocus(item.id);
                                }}
                            />
                        )}
                        {item.type === 'NOTE' && (
                            <div style={styles.note} className="art-border">
                                <span className="mono" style={{ color: 'var(--color-accent-sage)', marginBottom: '8px', display: 'block' }}>NOTE // 001</span>
                                <p style={styles.handwriting}>{item.data.text}</p>
                                <div style={styles.tape}></div>
                            </div>
                        )}
                    </DraggableArtifact>
                );
            })}

            <div style={styles.brandContainer}>
                <h1 style={styles.logo}>RAYKAZINE</h1>
                <div style={styles.tagline}>
                    <span className="mono">[media labs] v2.1</span>
                </div>

                {/* Index Link */}
                <button
                    style={styles.indexLink}
                    onClick={() => onNavigate('index')}
                >
                    <span className="mono" style={{ textDecoration: 'underline' }}>INDEX OF /</span>
                </button>
            </div>

            <ReaderModal
                isOpen={!!readContent}
                onClose={() => setReadContent(null)}
                content={readContent}
            />

        </main>
    );
};

const styles = {
    workbench: {
        width: '100%',
        height: '100vh',
        // Background handled by global body styles now
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
    },
    brandContainer: {
        position: 'absolute',
        top: '48px',
        left: '48px',
        zIndex: 10000, // Super high to avoid being covered
        opacity: 0.9,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        pointerEvents: 'none',
    },
    logo: {
        fontFamily: 'var(--font-display)',
        fontSize: '6rem',
        color: '#333',
        lineHeight: '0.8',
        marginBottom: '8px',
        marginLeft: '-4px',
        pointerEvents: 'auto', // Re-enable clicks if needed (e.g. for home link)
    },
    tagline: {
        alignSelf: 'flex-end',
        fontFamily: 'var(--font-pixel)',
        color: 'var(--color-text-muted)',
        marginTop: '0px',
        fontSize: '1rem',
        pointerEvents: 'auto',
    },
    indexLink: {
        marginTop: '24px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        padding: 0,
        color: 'var(--color-text)',
        opacity: 0.6,
        transition: 'opacity 0.2s',
        pointerEvents: 'auto', // Crucial: Enable clicking the link
    },
    note: {
        backgroundColor: '#fffebb', // Classic Post-it
        width: '240px',
        height: '240px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    handwriting: {
        fontFamily: 'var(--font-typewriter)',
        lineHeight: '1.4',
        fontSize: '1rem',
        color: '#333',
    },
    tape: {
        position: 'absolute',
        top: '-12px',
        left: '50%',
        width: '100px',
        height: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        transform: 'translateX(-50%) rotate(1deg)',
    }
};

export default Home;
