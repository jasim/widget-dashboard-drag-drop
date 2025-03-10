import React, { useState, useEffect, useRef } from 'react';
import { Layout, WidgetType } from '../../types';
import GridItem from './GridItem';
import { widgetsToLayout, layoutToWidgets, compactLayout } from '../../utils/gridUtils';
import styles from './Grid.module.css';

interface GridProps {
  widgets: WidgetType[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetType[]>>;
  cols: number;
  rowHeight: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  compactType?: 'vertical' | 'horizontal' | null;
  children: React.ReactNode[];
}

interface DragState {
  active: boolean;
  itemId: string | null;
  startPos: { x: number; y: number };
  startGrid: { x: number; y: number };
}

interface ResizeState {
  active: boolean;
  itemId: string | null;
  startPos: { x: number; y: number };
  startSize: { w: number; h: number };
}

const Grid: React.FC<GridProps> = ({
  widgets,
  setWidgets,
  cols = 12,
  rowHeight = 100,
  isDraggable = true,
  isResizable = true,
  compactType = 'vertical',
  children
}) => {
  const [layout, setLayout] = useState<Layout[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Drag and resize state
  const [dragState, setDragState] = useState<DragState>({
    active: false,
    itemId: null,
    startPos: { x: 0, y: 0 },
    startGrid: { x: 0, y: 0 }
  });
  
  const [resizeState, setResizeState] = useState<ResizeState>({
    active: false,
    itemId: null,
    startPos: { x: 0, y: 0 },
    startSize: { w: 0, h: 0 }
  });

  // Calculate column width based on container width
  const colWidth = containerWidth / cols;

  // Initialize layout from widgets
  useEffect(() => {
    setLayout(widgetsToLayout(widgets));
  }, [widgets]);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);
  
  // Set up global event listeners for drag and resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.active && dragState.itemId) {
        // Handle dragging
        const deltaX = e.clientX - dragState.startPos.x;
        const deltaY = e.clientY - dragState.startPos.y;
        
        // Convert pixel delta to grid units
        const gridDeltaX = Math.round(deltaX / colWidth);
        const gridDeltaY = Math.round(deltaY / rowHeight);
        
        const newX = Math.max(0, dragState.startGrid.x + gridDeltaX);
        const newY = Math.max(0, dragState.startGrid.y + gridDeltaY);
        
        // Update layout
        const newLayout = layout.map(item => 
          item.i === dragState.itemId ? { ...item, x: newX, y: newY } : item
        );
        setLayout(newLayout);
      } else if (resizeState.active && resizeState.itemId) {
        // Handle resizing
        const deltaX = e.clientX - resizeState.startPos.x;
        const deltaY = e.clientY - resizeState.startPos.y;
        
        // Convert pixel delta to grid units
        const gridDeltaW = Math.round(deltaX / colWidth);
        const gridDeltaH = Math.round(deltaY / rowHeight);
        
        const newW = Math.max(2, resizeState.startSize.w + gridDeltaW);
        const newH = Math.max(2, resizeState.startSize.h + gridDeltaH);
        
        // Update layout
        const newLayout = layout.map(item => 
          item.i === resizeState.itemId ? { ...item, w: newW, h: newH } : item
        );
        setLayout(newLayout);
      }
    };
    
    const handleMouseUp = () => {
      if (dragState.active || resizeState.active) {
        // Apply compaction if needed
        let newLayout = [...layout];
        if (compactType === 'vertical') {
          newLayout = compactLayout(newLayout);
        }
        
        // Update widgets with new layout
        setWidgets(layoutToWidgets(widgets, newLayout));
        
        // Reset states
        setDragState({
          active: false,
          itemId: null,
          startPos: { x: 0, y: 0 },
          startGrid: { x: 0, y: 0 }
        });
        
        setResizeState({
          active: false,
          itemId: null,
          startPos: { x: 0, y: 0 },
          startSize: { w: 0, h: 0 }
        });
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, resizeState, layout, colWidth, rowHeight, compactType, widgets, setWidgets]);
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    if (!isDraggable) return;
    
    e.preventDefault();
    const item = layout.find(item => item.i === id);
    if (!item) return;
    
    setDragState({
      active: true,
      itemId: id,
      startPos: { x: e.clientX, y: e.clientY },
      startGrid: { x: item.x, y: item.y }
    });
  };
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    if (!isResizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    const item = layout.find(item => item.i === id);
    if (!item) return;
    
    setResizeState({
      active: true,
      itemId: id,
      startPos: { x: e.clientX, y: e.clientY },
      startSize: { w: item.w, h: item.h }
    });
  };

  // Register item ref
  const registerItemRef = (id: string, ref: HTMLDivElement | null) => {
    if (ref) {
      itemRefs.current.set(id, ref);
    } else {
      itemRefs.current.delete(id);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={styles.gridContainer}
      style={{ height: `${Math.max(...layout.map(item => item.y + item.h), 4) * rowHeight}px` }}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        
        const widget = widgets[index];
        const layoutItem = layout.find(item => item.i === widget.id);
        
        if (!layoutItem) return null;
        
        return (
          <GridItem
            key={layoutItem.i}
            id={layoutItem.i}
            x={layoutItem.x}
            y={layoutItem.y}
            w={layoutItem.w}
            h={layoutItem.h}
            rowHeight={rowHeight}
            colWidth={colWidth}
            isDraggable={isDraggable}
            isResizable={isResizable}
            onDragStart={handleDragStart}
            onResizeStart={handleResizeStart}
            registerRef={registerItemRef}
            isDragging={dragState.active && dragState.itemId === layoutItem.i}
            isResizing={resizeState.active && resizeState.itemId === layoutItem.i}
          >
            {child}
          </GridItem>
        );
      })}
    </div>
  );
};

export default Grid;
