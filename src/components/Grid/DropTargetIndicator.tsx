import React from 'react';

interface DropTargetIndicatorProps {
  targetArea: {
    x: number;
    y: number;
    w: number;
    h: number;
  } | null;
  colWidth: number;
  rowHeight: number;
}

const DropTargetIndicator: React.FC<DropTargetIndicatorProps> = ({
  targetArea,
  colWidth,
  rowHeight
}) => {
  if (!targetArea) {
    return null;
  }

  const style = {
    position: 'absolute' as const,
    left: `${targetArea.x * colWidth}px`,
    top: `${targetArea.y * rowHeight}px`,
    width: `${targetArea.w * colWidth}px`,
    height: `${targetArea.h * rowHeight}px`,
    backgroundColor: 'rgba(59, 130, 246, 0.3)', // Tailwind blue-500 with opacity
    border: '2px dashed #3b82f6',
    zIndex: 10, // Increased z-index to be above other elements
    pointerEvents: 'none' as const,
    boxSizing: 'border-box' as const,
  };

  return <div style={style} />;
};

export default DropTargetIndicator;
