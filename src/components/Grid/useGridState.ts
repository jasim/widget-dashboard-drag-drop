import { useState, useEffect, useRef } from 'react';
import { Layout, WidgetType } from '../../types';
import { 
  widgetsToLayout, 
  layoutToWidgets, 
  compactLayout,
  updateLayoutItem,
  calculateDragPosition,
  calculateResizeSize
} from '../../utils/gridUtils';

interface DragState {
  active: boolean;
  itemId: string | null;
  startPos: { x: number; y: number };
  startGrid: { x: number; y: number };
  isResize: boolean;
  startSize?: { w: number; h: number };
}

interface UseGridStateProps {
  widgets: WidgetType[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetType[]>>;
  cols: number;
  compactType?: 'vertical' | 'horizontal' | null;
  rowHeight?: number;
}

// Default row height as a constant
export const rowHeight = 100;

export const useGridState = ({
  widgets,
  setWidgets,
  cols,
  compactType = 'vertical',
  rowHeight: propRowHeight
}: UseGridStateProps) => {
  // Use provided rowHeight or default
  const gridRowHeight = propRowHeight || rowHeight;
  const [layout, setLayout] = useState<Layout[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dragState, setDragState] = useState<DragState>({
    active: false,
    itemId: null,
    startPos: { x: 0, y: 0 },
    startGrid: { x: 0, y: 0 },
    isResize: false
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const resizeHandleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
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
          const newSize = calculateResizeSize(
            dragState.startSize,
            deltaX,
            deltaY,
            colWidth,
            gridRowHeight,
            2, // minW
            2  // minH
          );
          
          // Update layout
          const newLayout = updateLayoutItem(layout, dragState.itemId, newSize);
          setLayout(newLayout);
        } else {
          // Handle dragging
          const newPos = calculateDragPosition(
            dragState.startGrid,
            deltaX,
            deltaY,
            colWidth,
            rowHeight,
            cols
          );
          
          // Update layout
          const newLayout = updateLayoutItem(layout, dragState.itemId, newPos);
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
  }, [dragState, layout, colWidth, rowHeight, compactType, widgets, setWidgets]);
  
  // Start dragging
  const startDrag = (id: string, e: React.MouseEvent, isResize: boolean = false) => {
    e.preventDefault();
    
    const item = layout.find(item => item.i === id);
    if (!item) return;
    
    if (isResize) {
      setDragState({
        active: true,
        itemId: id,
        startPos: { x: e.clientX, y: e.clientY },
        startGrid: { x: item.x, y: item.y },
        isResize: true,
        startSize: { w: item.w, h: item.h }
      });
    } else {
      setDragState({
        active: true,
        itemId: id,
        startPos: { x: e.clientX, y: e.clientY },
        startGrid: { x: item.x, y: item.y },
        isResize: false
      });
    }
  };
  
  // Register refs
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
  
  return {
    layout,
    containerRef,
    colWidth,
    dragState,
    startDrag,
    registerItemRef,
    registerResizeHandleRef
  };
};

