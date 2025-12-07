import React, { useState } from 'react';
import { contentItems } from '../data/content';
import ReaderModal from '../components/ReaderModal';
import TapePlayer from '../components/TapePlayer';

const IndexPage = ({ onNavigate }) => {
    const [readContent, setReadContent] = useState(null);
    const [playingTape, setPlayingTape] = useState(null);

    const handleItemClick = (e, item) => {
        e.preventDefault();
        // Format content for reader if needed
        if (item.type === 'ESSAY') {
            setReadContent(item.data);
        } else if (item.type === 'TAPE') {
            // Tapes might not open in reader, or maybe they do? 
            // For now let's just show description in reader for consistency
            // Open the tape player overlay
            setPlayingTape({ ...item.data, id: item.id });
        } else if (item.type === 'NOTE') {
            setReadContent({ ...item.data, title: 'Note', type: 'NOTE', excerpt: item.data.text });
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Index of /raykazine</h1>
                    <button onClick={() => onNavigate('workbench')} style={styles.backLink}>[..] Parent Directory (Workbench)</button>
                </header>

                <hr style={styles.hr} />

                <ul style={styles.list}>
                    {contentItems.map(item => (
                        <li key={item.id} style={styles.item}>
                            <span style={styles.meta}>
                                [{item.type}] - {item.data.date || 'N/A'}
                            </span>
                            <a href="#" style={styles.link} onClick={(e) => handleItemClick(e, item)}>
                                {item.data.title || item.data.text || 'Untitled'}
                            </a>
                            {item.type === 'TAPE' && <span style={styles.size}> - {item.data.duration}</span>}
                        </li>
                    ))}
                </ul>

                <hr style={styles.hr} />
                <footer style={styles.footer}>
                    <small>Raykazine Media Labs Server/1.0</small>
                    <br />
                    <small style={{ opacity: 0.6 }}>Served by: VT323 System</small>
                </footer>
            </div>

            <ReaderModal
                isOpen={!!readContent}
                onClose={() => setReadContent(null)}
                content={readContent}
            />

            {/* Overlay Player for Index Mode */}
            {playingTape && (
                <div style={styles.playerOverlay} onClick={() => setPlayingTape(null)}>
                    <div onClick={e => e.stopPropagation()}>
                        <TapePlayer
                            {...playingTape}
                            isFocused={true}
                            onTogglePlay={(playing) => {
                                // Optional: handle play state track
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    pageWrapper: {
        // Inherits global body background (Sepia + Grid)
        minHeight: '100vh',
        width: '100%',
    },
    container: {
        fontFamily: 'var(--font-terminal)',
        fontSize: '1.2rem', // VT323 is usually a bit small, so bumping it up
        padding: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        // removed local background color to let wrapper show through, or keep same
        backgroundColor: 'transparent',
        color: '#3e3b32', // Dark brownish grey for soft contrast
    },
    header: {
        marginBottom: '20px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'normal',
        marginBottom: '10px',
        textTransform: 'uppercase',
    },
    backLink: {
        background: 'none',
        border: 'none',
        padding: 0,
        color: '#8b4513', // Saddle Brown link
        textDecoration: 'underline',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '1.2rem',
    },
    hr: {
        border: 'none',
        borderTop: '1px dashed #a89f91',
        margin: '20px 0',
    },
    list: {
        listStyleType: 'none', // Raw terminal style often lacks bullets or uses custom ones
        paddingLeft: '0',
    },
    item: {
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'baseline',
    },
    meta: {
        marginRight: '12px',
        color: '#6b665c',
        minWidth: '180px', // Column alignment
    },
    link: {
        color: '#0000AA', // Classic web link blue, but maybe slightly muted? Let's go with a retro blue.
        textDecoration: 'none',
        cursor: 'pointer',
    },
    size: {
        marginLeft: '8px',
        color: '#6b665c',
    },
    footer: {
        fontSize: '1rem',
        color: '#6b665c',
        marginTop: '40px',
    },
    playerOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    }
};

export default IndexPage;
