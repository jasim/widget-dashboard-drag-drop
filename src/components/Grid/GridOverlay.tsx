import React from 'react';
import styles from './Grid.module.css';

interface GridOverlayProps {
  visible: boolean;
  cols: number;
  rowHeight: number;
  containerWidth: number;
  containerHeight: number;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  visible,
  cols,
  rowHeight,
  containerWidth,
  containerHeight
}) => {
  if (!visible) return null;

  const colWidth = containerWidth / cols;
  const rows = Math.ceil(containerHeight / rowHeight);

  // Create grid dots
  const dots = [];
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      dots.push(
        <div
          key={`dot-${x}-${y}`}
          className={styles.gridDot}
          style={{
            left: `${x * colWidth}px`,
            top: `${y * rowHeight}px`,
          }}
        />
      );
    }
  }

  return (
    <div className={styles.gridOverlay}>
      {dots}
    </div>
  );
};

export default GridOverlay;
