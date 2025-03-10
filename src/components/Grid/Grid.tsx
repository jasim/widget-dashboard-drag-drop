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
  isResize: boolean;
  startSize?: { w: number; h: number };
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
  const resizeHandleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Unified drag/resize state
  const [dragState, setDragState] = useState<DragState>({
    active: false,
    itemId: null,
    startPos: { x: 0, y: 0 },
    startGrid: { x: 0, y: 0 },
    isResize: false
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
        const deltaX = e.clientX - dragState.startPos.x;
        const deltaY = e.clientY - dragState.startPos.y;
        
        if (dragState.isResize && dragState.startSize) {
          // Handle resizing
          // Convert pixel delta to grid units
          const gridDeltaW = Math.round(deltaX / colWidth);
          const gridDeltaH = Math.round(deltaY / rowHeight);
          
          const newW = Math.max(2, dragState.startSize.w + gridDeltaW);
          const newH = Math.max(2, dragState.startSize.h + gridDeltaH);
          
          // Update layout
          const newLayout = layout.map(item => 
            item.i === dragState.itemId ? { ...item, w: newW, h: newH } : item
          );
          setLayout(newLayout);
        } else {
          // Handle dragging
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
        }
      }
    };
    
    const handleMouseUp = () => {
      if (dragState.active) {
        // Apply compaction if needed
        let newLayout = [...layout];
        if (compactType === 'vertical') {
          newLayout = compactLayout(newLayout);
        }
        
        // Update widgets with new layout
        setWidgets(layoutToWidgets(widgets, newLayout));
        
        // Reset state
        setDragState({
          active: false,
          itemId: null,
          startPos: { x: 0, y: 0 },
          startGrid: { x: 0, y: 0 },
          isResize: false
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
  
  // Handle mouse down on the grid container
  const handleMouseDown = (e: React.MouseEvent) => {
    // Find the target element and check if it's a grid item or resize handle
    const target = e.target as HTMLElement;
    
    // Find the closest grid item parent
    let gridItemElement = target.closest(`.${styles.gridItem}`) as HTMLElement;
    if (!gridItemElement) return;
    
    // Get the widget id from the element
    const id = gridItemElement.dataset.id;
    if (!id) return;
    
    const item = layout.find(item => item.i === id);
    if (!item) return;
    
    // Check if it's a resize handle
    const isResizeHandle = target.closest(`.${styles.resizeHandle}`);
    
    if (isResizeHandle && isResizable) {
      // Handle resize start
      e.preventDefault();
      e.stopPropagation();
      
      setDragState({
        active: true,
        itemId: id,
        startPos: { x: e.clientX, y: e.clientY },
        startGrid: { x: item.x, y: item.y },
        isResize: true,
        startSize: { w: item.w, h: item.h }
      });
    } else if (isDraggable) {
      // Handle drag start
      e.preventDefault();
      
      setDragState({
        active: true,
        itemId: id,
        startPos: { x: e.clientX, y: e.clientY },
        startGrid: { x: item.x, y: item.y },
        isResize: false
      });
    }
  };

  // Register item and resize handle refs
  const registerItemRef = (id: string, ref: HTMLDivElement | null) => {
    if (ref) {
      itemRefs.current.set(id, ref);
    } else {
      itemRefs.current.delete(id);
    }
  };
  
  const registerResizeHandleRef = (id: string, ref: HTMLDivElement | null) => {
    if (ref) {
      resizeHandleRefs.current.set(id, ref);
    } else {
      resizeHandleRefs.current.delete(id);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={styles.gridContainer}
      style={{ height: `${Math.max(...layout.map(item => item.y + item.h), 4) * rowHeight}px` }}
      onMouseDown={handleMouseDown}
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
            isResizable={isResizable}
            registerRef={registerItemRef}
            registerResizeHandleRef={registerResizeHandleRef}
            isDragging={dragState.active && dragState.itemId === layoutItem.i && !dragState.isResize}
            isResizing={dragState.active && dragState.itemId === layoutItem.i && dragState.isResize}
          >
            {child}
          </GridItem>
        );
      })}
    </div>
  );
};

export default Grid;
