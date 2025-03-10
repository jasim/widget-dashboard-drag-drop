import { useState } from 'react';
import { Layout } from '@/types.ts';
import { updateLayoutItem } from '../layout';
import { calculateDragPosition, calculateResizeSize, handleResizeWithCollisions } from '../geometry';
import { calculateDropTarget, applyDropOperation, DragTarget } from '../dragOperations';

export interface DragState {
  active: boolean;
  itemId: string | null;
  startPos: { x: number; y: number };
  startGrid: { x: number; y: number };
  isResize: boolean;
  startSize?: { w: number; h: number };
  originalItem?: Layout;
  dropTarget?: DragTarget;
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

    setDragState({
      active: true,
      itemId: id,
      startPos: { x: clientX, y: clientY },
      startGrid: { x: item.x, y: item.y },
      isResize,
      originalItem: { ...item },
      ...(isResize ? { startSize: { w: item.w, h: item.h } } : {})
    });
  };

  // Update drag position
  const updateDragPosition = (clientX: number, clientY: number) => {
    if (!dragState.active || !dragState.itemId) return;

    const deltaX = clientX - dragState.startPos.x;
    const deltaY = clientY - dragState.startPos.y;

    const draggedItem = layout.find(item => item.i === dragState.itemId);
    if (!draggedItem) return;

    if (dragState.isResize && dragState.startSize) {
      // Handle resizing using pure function
      const { w, h } = calculateResizeSize(
        dragState.startSize,
        deltaX,
        deltaY,
        colWidth,
        rowHeight,
        2, // minW
        2  // minH
      );

      // Get the original item before resize
      const originalItem = layout.find(item => item.i === dragState.itemId);
      
      if (originalItem) {
        // Use the new function to handle resize with collisions
        const newLayout = handleResizeWithCollisions(
          layout,
          dragState.itemId,
          w,
          h,
          originalItem
        );
        
        // Update the entire layout
        updateLayout(newLayout);
      }
    } else {
      // Handle dragging using pure function
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
    
    // Calculate delta from start position
    const deltaX = clientX - dragState.startPos.x;
    const deltaY = clientY - dragState.startPos.y;
    
    // Use pure function to calculate drop target
    const dropTarget = calculateDropTarget(
      draggedItem,
      gridX,
      gridY,
      layout,
      deltaX,
      deltaY,
      dragState.startGrid,
      colWidth,
      rowHeight,
      cols
    );
    
    // Update drag state with the target information
    setDragState(prev => ({
      ...prev,
      dropTarget
    }));
    
    // Also update the visual indicator
    if (setDropTargetArea) {
      setDropTargetArea(dropTarget.targetArea);
    }
  };

  // End drag operation
  const endDrag = () => {
    if (dragState.active && dragState.itemId) {
      // Apply the drop operation using pure function
      const newLayout = applyDropOperation(
        layout,
        dragState.itemId,
        dragState.isResize,
        dragState.dropTarget,
        dragState.originalItem
      );
      
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
