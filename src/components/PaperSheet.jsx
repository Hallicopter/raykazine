import React from 'react';
import { Maximize2 } from 'lucide-react';

const PaperSheet = ({ title, date, excerpt, type = "ESSAY", onRead }) => {
    return (
        <div style={styles.sheet} className="art-border">
            <div style={styles.topMeta}>
                <span className="mono">{type} &mdash; NO. {Math.floor(Math.random() * 100)}</span>
                <span className="mono">{date}</span>
            </div>

            <div style={styles.content}>
                <h2 style={styles.title}>{title}</h2>
                <div style={styles.rule}></div>
                <p style={styles.body}>{excerpt}</p>
            </div>

            <div style={styles.footer}>
                <div style={styles.signature}>Raykazine Labs</div>
                <button
                    style={styles.expandBtn}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRead && onRead();
                    }}
                >
                    <span className="mono" style={{ marginRight: '8px' }}>READ FULL</span>
                    <Maximize2 size={12} />
                </button>
            </div>
        </div>
    );
};

const styles = {
    sheet: {
        backgroundColor: '#ffffff',
        width: '340px',
        minHeight: '480px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    topMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '32px',
        borderBottom: '1px solid #eee',
        paddingBottom: '8px',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: '2rem',
        marginBottom: '24px',
        lineHeight: '1.1',
    },
    rule: {
        width: '100%',
        height: '1px',
        backgroundColor: 'var(--color-text)',
        marginBottom: '24px',
        opacity: 0.2,
    },
    body: {
        fontFamily: 'var(--font-typewriter)',
        fontSize: '1rem',
        lineHeight: '1.6',
        color: '#333',
        textAlign: 'justify',
    },
    footer: {
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '32px',
    },
    signature: {
        fontFamily: 'var(--font-display)',
        fontSize: '0.9rem',
        color: 'var(--color-text-muted)',
        opacity: 0.7,
    },
    expandBtn: {
        background: 'none',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '6px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        opacity: 0.6,
        transition: 'opacity 0.2s',
    }
};

export default PaperSheet;
