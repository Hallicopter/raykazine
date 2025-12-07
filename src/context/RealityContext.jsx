import React, { createContext, useContext, useState, useEffect } from 'react';

const RealityContext = createContext();

export const REALITIES = {
    DEFAULT: 'DEFAULT',
    CHAOS: 'CHAOS',
    ZEN: 'ZEN',
    TERMINAL: 'TERMINAL'
};

export const RealityProvider = ({ children }) => {
    const [reality, setReality] = useState(REALITIES.DEFAULT);
    const [commandHistory, setCommandHistory] = useState([]);

    const executeCommand = (cmd) => {
        const cleanCmd = cmd.trim().toLowerCase();
        setCommandHistory(prev => [...prev, cmd]);

        if (cleanCmd.includes('chaos')) setReality(REALITIES.CHAOS);
        else if (cleanCmd.includes('zen')) setReality(REALITIES.ZEN);
        else if (cleanCmd.includes('terminal') || cleanCmd.includes('code')) setReality(REALITIES.TERMINAL);
        else if (cleanCmd.includes('reset') || cleanCmd.includes('default')) setReality(REALITIES.DEFAULT);
        else return false; // Command not recognized

        return true;
    };

    return (
        <RealityContext.Provider value={{ reality, executeCommand, commandHistory, REALITIES }}>
            <div data-reality={reality} className={`reality-wrapper reality-${reality.toLowerCase()}`}>
                {children}
            </div>
        </RealityContext.Provider>
    );
};

export const useReality = () => useContext(RealityContext);
