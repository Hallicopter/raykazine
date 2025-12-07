import React from 'react';

const Header = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <header style={styles.header}>
            <div className="container">
                <div style={styles.topRow}>
                    <div className="mono">VOL. 01</div>
                    <div className="mono text-right">{today}</div>
                </div>

                <div style={styles.brandRow}>
                    <h1 style={styles.brand}>RAYKAZINE</h1>
                </div>

                <div style={styles.navRow}>
                    <nav style={styles.nav}>
                        <a href="#feed" style={styles.link}>INDEX</a>
                        <span className="mono" style={{ margin: '0 8px' }}>/</span>
                        <a href="#about" style={styles.link}>ABOUT</a>
                        <span className="mono" style={{ margin: '0 8px' }}>/</span>
                        <a href="#submit" style={styles.link}>SUBMIT</a>
                    </nav>
                </div>
                <hr />
            </div>
        </header>
    );
};

const styles = {
    header: {
        paddingTop: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-xl)',
    },
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 'var(--spacing-xs)',
    },
    brandRow: {
        textAlign: 'center',
        padding: 'var(--spacing-lg) 0',
    },
    brand: {
        fontSize: 'clamp(3rem, 15vw, 9rem)', /* Huge responsive font */
        lineHeight: '0.8',
        marginBottom: 0,
        textTransform: 'uppercase',
    },
    navRow: {
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'var(--spacing-md)',
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
    },
    link: {
        fontFamily: 'var(--font-sans)',
        fontWeight: '300',
        fontSize: '1.1rem',
        textDecoration: 'none',
        color: 'var(--color-text)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    }
};

export default Header;
