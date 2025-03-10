import { useState } from 'react';
import { Layout } from '../../types';
import { updateLayoutItem } from '../layout';
import { calculateDragPosition, calculateResizeSize } from '../geometry';
import { decideDropAction, applyDropAction, DropAction } from '../placement';

export interface DragState {
  active: boolean;
  itemId: string | null;
  startPos: { x: number; y: number };
  startGrid: { x: number; y: number };
  isResize: boolean;
  startSize?: { w: number; h: number };
  dropTarget?: {
    targetItem: Layout | null;
    targetArea: { x: number; y: number; w: number; h: number };
    dropAction?: DropAction | null;
  };
}

interface UseDragStateProps {
  layout: Layout[];
  updateLayout: (layout: Layout[]) => void;
  cols: number;
  rowHeight: number;
  colWidth: number;
  setDropTargetArea?: React.Dispatch<React.SetStateAction<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>>;
}

export const useDragState = ({
  layout,
  updateLayout,
  cols,
  rowHeight,
  colWidth,
  setDropTargetArea
}: UseDragStateProps) => {
  const [dragState, setDragState] = useState<DragState>({
    active: false,
    itemId: null,
    startPos: { x: 0, y: 0 },
    startGrid: { x: 0, y: 0 },
    isResize: false
  });

  // Start dragging
  const startDrag = (id: string, clientX: number, clientY: number, isResize: boolean = false) => {
    const item = layout.find(item => item.i === id);
    if (!item) return;

    if (isResize) {
      setDragState({
        active: true,
        itemId: id,
        startPos: { x: clientX, y: clientY },
        startGrid: { x: item.x, y: item.y },
        isResize: true,
        startSize: { w: item.w, h: item.h }
      });
    } else {
      setDragState({
        active: true,
        itemId: id,
        startPos: { x: clientX, y: clientY },
        startGrid: { x: item.x, y: item.y },
        isResize: false
      });
    }
  };

  // Update drag position
  const updateDragPosition = (clientX: number, clientY: number) => {
    if (!dragState.active || !dragState.itemId) return;

    const deltaX = clientX - dragState.startPos.x;
    const deltaY = clientY - dragState.startPos.y;

    const draggedItem = layout.find(item => item.i === dragState.itemId);
    if (!draggedItem) return;

    if (dragState.isResize && dragState.startSize) {
      // Handle resizing - pure function
      const { w, h } = calculateResizeSize(
        dragState.startSize,
        deltaX,
        deltaY,
        colWidth,
        rowHeight,
        2, // minW
        2  // minH
      );

      // Update layout with new size
      updateLayout(updateLayoutItem(layout, dragState.itemId, { w, h }));
    } else {
      // Handle dragging - pure function
      const { x, y } = calculateDragPosition(
        dragState.startGrid,
        deltaX,
        deltaY,
        colWidth,
        rowHeight,
        cols
      );

      // Update layout with new position
      updateLayout(updateLayoutItem(layout, dragState.itemId, { x, y }));
    }
  };

  // Calculate and update drop target area
  const updateDropTargetArea = (
    clientX: number, 
    clientY: number, 
    containerRect: DOMRect
  ) => {
    if (!dragState.active || dragState.isResize || !dragState.itemId) return;

    // Get mouse position relative to container
    const mouseX = clientX - containerRect.left;
    const mouseY = clientY - containerRect.top;
    
    // Convert to grid coordinates
    const gridX = Math.floor(mouseX / colWidth);
    const gridY = Math.floor(mouseY / rowHeight);
    
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
      
      // Store the drop action for debugging display
    } else {
      // Not hovering over another item, calculate position based on drag delta
      const deltaX = clientX - dragState.startPos.x;
      const deltaY = clientY - dragState.startPos.y;
    
      // Calculate new position using pure function
      const { x, y } = calculateDragPosition(
        dragState.startGrid,
        deltaX,
        deltaY,
        colWidth,
        rowHeight,
        cols
      );
    
      targetArea = {
        x,
        y,
        w: draggedItem.w,
        h: draggedItem.h
      };
    }
    
    // Update drag state with the target information
    setDragState(prev => ({
      ...prev,
      dropTarget: {
        targetItem: targetItem || null, // Ensure it's Layout | null, not undefined
        targetArea,
        dropAction: targetItem ? decideDropAction(draggedItem, targetItem) : null
      }
    }));
    
    // Also update the visual indicator
    if (setDropTargetArea) {
      setDropTargetArea(targetArea);
    }
  };

  // End drag operation
  const endDrag = () => {
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
      
      // Update layout
      updateLayout(newLayout);
      
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

  return {
    dragState,
    startDrag,
    updateDragPosition,
    updateDropTargetArea,
    endDrag
  };
};
