import React from 'react';
import { motion } from 'framer-motion';

const DraggableArtifact = ({
    children,
    id,
    initialX = 0,
    initialY = 0,
    rotate = 0,
    isFocused,
    onFocus,
    baseZ = 1
}) => {
    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x: initialX, y: initialY, rotate: rotate }}
            onPointerDown={() => onFocus(id)} // Focus on click/drag start
            animate={{
                zIndex: isFocused ? 100 : baseZ,
                scale: isFocused ? 1.02 : 1
            }}
            whileHover={{ scale: 1.03, cursor: 'grab' }}
            whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 101 }}
            style={{
                position: 'absolute',
            }}
        >
            {children}
        </motion.div>
    );
};

export default DraggableArtifact;
