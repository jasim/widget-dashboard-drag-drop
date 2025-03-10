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
  dropTarget?: {
    targetItem: Layout | null;
    targetArea: { x: number; y: number; w: number; h: number };
  };
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
    isResize: false,
    dropTarget: undefined
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
      if (dragState.active && dragState.itemId) {
        // Find the dragged item
        const draggedItem = layout.find(item => item.i === dragState.itemId);
        if (!draggedItem) return;
        
        let newLayout = [...layout];
        
        if (!dragState.isResize && dragState.dropTarget) {
          const { targetItem, targetArea } = dragState.dropTarget;
          
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
            // Standard grid placement - use the target area that was already calculated
            const newPos = {
              x: targetArea.x,
              y: targetArea.y
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
          isResize: false,
          dropTarget: undefined
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
        startSize: { w: item.w, h: item.h },
        dropTarget: undefined
      });
    } else {
      setDragState({
        active: true,
        itemId: id,
        startPos: { x: e.clientX, y: e.clientY },
        startGrid: { x: item.x, y: item.y },
        isResize: false,
        dropTarget: undefined
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
    if (!dragState.active || dragState.isResize) return;
    
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
    // Explicitly exclude the item being dragged
    const targetItem = layout.find(item => 
      item.i !== dragState.itemId && // Not the same item
      gridX >= item.x && gridX < item.x + item.w && // Within x bounds
      gridY >= item.y && gridY < item.y + item.h    // Within y bounds
    );

    let targetArea;
    
    if (targetItem) {
      // We're hovering over another item, use placement logic
      const action = decideDropAction(draggedItem, targetItem);
      
      // Calculate the preview based on the action
      const { source } = applyDropAction(draggedItem, targetItem, action);
      
      // Create target area
      targetArea = {
        x: source.x,
        y: source.y,
        w: source.w,
        h: source.h
      };
    } else {
      // Not hovering over another item, calculate position based on drag delta
      const deltaX = e.clientX - dragState.startPos.x;
      const deltaY = e.clientY - dragState.startPos.y;
    
      // Convert pixel delta to grid units
      const gridDeltaX = Math.round(deltaX / colWidth);
      const gridDeltaY = Math.round(deltaY / gridRowHeight);
    
      // Calculate new position based on starting position plus delta
      const newX = Math.max(0, Math.min(dragState.startGrid.x + gridDeltaX, cols - draggedItem.w));
      const newY = Math.max(0, dragState.startGrid.y + gridDeltaY);
    
      targetArea = {
        x: newX,
        y: newY,
        w: draggedItem.w,
        h: draggedItem.h
      };
    }
    
    // Update drag state with the target information
    setDragState(prev => ({
      ...prev,
      dropTarget: {
        targetItem,
        targetArea
      }
    }));
    
    // Also update the visual indicator
    if (setDropTargetArea) {
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

