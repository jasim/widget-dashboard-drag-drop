import React, { useRef, useEffect } from 'react';
import styles from './Grid.module.css';

interface GridItemProps {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rowHeight: number;
  colWidth: number;
  isDraggable: boolean;
  isResizable: boolean;
  isDragging: boolean;
  isResizing: boolean;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
  registerRef: (id: string, ref: HTMLDivElement | null) => void;
  children: React.ReactNode;
}

const GridItem: React.FC<GridItemProps> = ({
  id,
  x,
  y,
  w,
  h,
  rowHeight,
  colWidth,
  isDraggable,
  isResizable,
  isDragging,
  isResizing,
  onDragStart,
  onResizeStart,
  registerRef,
  children
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  // Register ref with parent Grid component
  useEffect(() => {
    registerRef(id, elementRef.current);
    return () => registerRef(id, null);
  }, [id, registerRef]);

  // Calculate position and size in pixels
  const style = {
    transform: `translate(${x * colWidth}px, ${y * rowHeight}px)`,
    width: `${w * colWidth}px`,
    height: `${h * rowHeight}px`,
    position: 'absolute' as const,
    transition: isDragging || isResizing ? 'none' : 'transform 0.2s, width 0.2s, height 0.2s',
    zIndex: isDragging || isResizing ? 2 : 1
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isDraggable) return;
    onDragStart(e, id);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isResizable) return;
    onResizeStart(e, id);
  };

  return (
    <div
      ref={elementRef}
      className={styles.gridItem}
      style={style}
      onMouseDown={handleDragStart}
    >
      {children}
      {isResizable && (
        <div 
          className={styles.resizeHandle}
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
};

export default GridItem;
