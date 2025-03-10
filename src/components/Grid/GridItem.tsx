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
  isResizable: boolean;
  isDragging: boolean;
  isResizing: boolean;
  registerRef: (id: string, ref: HTMLDivElement | null) => void;
  registerResizeHandleRef: (id: string, ref: HTMLDivElement | null) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
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
  isResizable,
  isDragging,
  isResizing,
  registerRef,
  registerResizeHandleRef,
  onMouseEnter,
  onMouseLeave,
  children
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Register refs with parent Grid component
  useEffect(() => {
    registerRef(id, elementRef.current);
    return () => registerRef(id, null);
  }, [id, registerRef]);

  useEffect(() => {
    if (isResizable && resizeHandleRef.current) {
      registerResizeHandleRef(id, resizeHandleRef.current);
      return () => registerResizeHandleRef(id, null);
    }
  }, [id, isResizable, registerResizeHandleRef]);

  // Calculate position and size in pixels
  const style = {
    left: `${x * colWidth}px`,
    top: `${y * rowHeight}px`,
    width: `${w * colWidth}px`,
    height: `${h * rowHeight}px`,
    position: 'absolute' as const,
    transition: isDragging || isResizing ? 'none' : 'left 0.2s, top 0.2s, width 0.2s, height 0.2s',
    zIndex: isDragging || isResizing ? 2 : 1
  };

  return (
    <div
      ref={elementRef}
      className={styles.gridItem}
      style={style}
      data-id={id}
      data-grid-item="true"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      {isResizable && (
        <div 
          ref={resizeHandleRef}
          className={styles.resizeHandle}
          data-id={id}
          data-resize-handle="true"
        />
      )}
    </div>
  );
};

export default GridItem;
