import { useState, useEffect, useRef } from 'react';
import { Layout, WidgetType } from '../../types';
import { 
  widgetsToLayout, 
  layoutToWidgets, 
  compactLayout,
  updateLayoutItem,
  calculateDragPosition,
  calculateResizeSize,
  decideDropAction,
  applyDropAction
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
  setDropTargetArea?: React.Dispatch<React.SetStateAction<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>>;
}

// Default row height as a constant
export const rowHeight = 100;

export const useGridState = ({
  widgets,
  setWidgets,
  cols,
  compactType = null,
  rowHeight: propRowHeight,
  setDropTargetArea
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
    
    const handleMouseUp = (e: MouseEvent) => {
      if (dragState.active && dragState.itemId) {
        // Get mouse position relative to container
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;
        
        // Convert to grid coordinates
        const gridX = Math.floor(mouseX / colWidth);
        const gridY = Math.floor(mouseY / gridRowHeight);
        
        // Find the dragged item
        const draggedItem = layout.find(item => item.i === dragState.itemId);
        if (!draggedItem) return;
        
        let newLayout = [...layout];
        
        if (!dragState.isResize) {
          // Find if we're dropping onto another item
          const targetItem = layout.find(item => 
            item.i !== dragState.itemId && // Not the same item
            gridX >= item.x && gridX < item.x + item.w && // Within x bounds
            gridY >= item.y && gridY < item.y + item.h    // Within y bounds
          );
          
          if (targetItem) {
            // We're dropping onto another item, use placement logic
            const action = decideDropAction(draggedItem, targetItem);
            
            // Apply the action to get new positions
            const { source, target } = applyDropAction(draggedItem, targetItem, action);
            
            // Update the layout with new positions
            newLayout = newLayout.map(item => {
              if (item.i === draggedItem.i) {
                return { ...item, x: source.x, y: source.y, w: source.w, h: source.h };
              }
              if (item.i === targetItem.i) {
                return { ...item, x: target.x, y: target.y, w: target.w, h: target.h };
              }
              return item;
            });
          } else {
            // Standard grid placement - use the same logic as in updateDropTargetArea
            const newPos = {
              x: Math.max(0, Math.min(gridX, cols - draggedItem.w)),
              y: Math.max(0, gridY)
            };
            
            // Update layout
            newLayout = updateLayoutItem(newLayout, dragState.itemId, newPos);
          }
        }
        
        // No compaction - widgets stay where they are placed
        
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
        
        // Clear drop target area
        if (setDropTargetArea) {
          setDropTargetArea(null);
        }
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
  
  // Function to calculate and update drop target area
  const updateDropTargetArea = (e: React.MouseEvent) => {
    if (!dragState.active || dragState.isResize || !setDropTargetArea) return;
    
    // Get mouse position relative to container
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;
    
    // Convert to grid coordinates
    const gridX = Math.floor(mouseX / colWidth);
    const gridY = Math.floor(mouseY / gridRowHeight);
    
    // Find the dragged item
    const draggedItem = layout.find(item => item.i === dragState.itemId);
    if (!draggedItem) return;
    
    // Find if we're hovering over another item
    const targetItem = layout.find(item => 
      item.i !== dragState.itemId && // Not the same item
      gridX >= item.x && gridX < item.x + item.w && // Within x bounds
      gridY >= item.y && gridY < item.y + item.h    // Within y bounds
    );
    
    if (targetItem) {
      // We're hovering over another item, use placement logic
      const action = decideDropAction(draggedItem, targetItem);
      
      // Calculate the preview based on the action
      const { source } = applyDropAction(draggedItem, targetItem, action);
      
      // Update the drop target area to show the preview
      setDropTargetArea({
        x: source.x,
        y: source.y,
        w: source.w,
        h: source.h
      });
    } else {
      // Not hovering over another item, use standard grid placement
      // Calculate the position based on the mouse position, not grid position
      // This ensures the widget follows the cursor exactly
      const targetArea = {
        x: Math.max(0, Math.min(gridX, cols - draggedItem.w)),
        y: Math.max(0, gridY),
        w: draggedItem.w,
        h: draggedItem.h
      };
      
      setDropTargetArea(targetArea);
    }
  };

  return {
    layout,
    containerRef,
    colWidth,
    dragState,
    startDrag,
    registerItemRef,
    registerResizeHandleRef,
    updateDropTargetArea
  };
};

