import React, { useState, useRef, useEffect } from 'react';
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
  onDragStart: () => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragStop: () => void;
  onResizeStart: () => void;
  onResize: (id: string, w: number, h: number) => void;
  onResizeStop: () => void;
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
  onDragStart,
  onDrag,
  onDragStop,
  onResizeStart,
  onResize,
  onResizeStop,
  children
}) => {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ w: 0, h: 0 });
  const [startGrid, setStartGrid] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Calculate position and size in pixels
  const style = {
    transform: `translate(${x * colWidth}px, ${y * rowHeight}px)`,
    width: `${w * colWidth}px`,
    height: `${h * rowHeight}px`,
    position: 'absolute' as const,
    transition: dragging || resizing ? 'none' : 'transform 0.2s, width 0.2s, height 0.2s',
    zIndex: dragging || resizing ? 2 : 1
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isDraggable) return;
    
    e.preventDefault();
    setDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartGrid({ x, y });
    onDragStart();
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragStop);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragging) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    // Convert pixel delta to grid units
    const gridDeltaX = Math.round(deltaX / colWidth);
    const gridDeltaY = Math.round(deltaY / rowHeight);
    
    const newX = Math.max(0, startGrid.x + gridDeltaX);
    const newY = Math.max(0, startGrid.y + gridDeltaY);
    
    onDrag(id, newX, newY);
  };

  const handleDragStop = () => {
    setDragging(false);
    onDragStop();
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragStop);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isResizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ w, h });
    onResizeStart();
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeStop);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    // Convert pixel delta to grid units
    const gridDeltaW = Math.round(deltaX / colWidth);
    const gridDeltaH = Math.round(deltaY / rowHeight);
    
    const newW = Math.max(2, startSize.w + gridDeltaW); // Minimum width of 2
    const newH = Math.max(2, startSize.h + gridDeltaH); // Minimum height of 2
    
    onResize(id, newW, newH);
  };

  const handleResizeStop = () => {
    setResizing(false);
    onResizeStop();
    
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeStop);
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragStop);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeStop);
    };
  }, []);

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
