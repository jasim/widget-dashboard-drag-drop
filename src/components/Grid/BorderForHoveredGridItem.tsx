import React, { useState, useEffect } from 'react';

interface BorderForHoveredGridItemProps {
  hoveredItemId: string | null;
  layout: Array<{ i: string; x: number; y: number; w: number; h: number }>;
  colWidth: number;
  rowHeight: number;
}

const BorderForHoveredGridItem: React.FC<BorderForHoveredGridItemProps> = ({
  hoveredItemId,
  layout,
  colWidth,
  rowHeight
}) => {
  const [style, setStyle] = useState({
    display: 'none',
    transform: 'translate(0px, 0px)',
    width: '0px',
    height: '0px'
  });

  useEffect(() => {
    if (!hoveredItemId) {
      setStyle(prev => ({ ...prev, display: 'none' }));
      return;
    }

    const item = layout.find(item => item.i === hoveredItemId);
    if (!item) {
      setStyle(prev => ({ ...prev, display: 'none' }));
      return;
    }

    setStyle({
      display: 'block',
      left: `${item.x * colWidth}px`,
      top: `${item.y * rowHeight}px`,
      width: `${item.w * colWidth}px`,
      height: `${item.h * rowHeight}px`
    });
  }, [hoveredItemId, layout, colWidth, rowHeight]);

  return (
    <div
      style={{
        ...style,
        position: 'absolute',
        border: '2px solid #3b82f6', // Tailwind blue-500
        pointerEvents: 'none',
        zIndex: 3,
        boxSizing: 'border-box',
      }}
    />
  );
};

export default BorderForHoveredGridItem;
