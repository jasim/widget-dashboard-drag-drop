import {Layout} from '../types';
import {calculateDragPosition} from './geometry';
import {updateLayoutItem} from './layout';
import {applyDropAction, decideDropAction, DropAction} from './placement';

export interface DragTarget {
  targetItem: Layout | null;
  targetArea: { x: number; y: number; w: number; h: number };
  dropAction: DropAction | null;
}

/**
 * Calculate the target area for a dragged item
 */
export function calculateDropTarget(
  draggedItem: Layout,
  mouseGridX: number,
  mouseGridY: number,
  layout: Layout[],
  dragDeltaX: number,
  dragDeltaY: number,
  startGrid: { x: number; y: number },
  colWidth: number,
  rowHeight: number,
  cols: number
): DragTarget {
  // Find if we're hovering over another item (excluding the dragged item)
  const targetItem = layout.find(item => 
    item.i !== draggedItem.i && 
    mouseGridX >= item.x && mouseGridX < item.x + item.w && 
    mouseGridY >= item.y && mouseGridY < item.y + item.h
  ) || null;

  let targetArea;
  let dropAction = null;
  
  if (targetItem) {
    // We're hovering over another item, use placement logic
    dropAction = decideDropAction(draggedItem, targetItem);
    
    // Calculate the preview based on the action
    const { source } = applyDropAction(draggedItem, targetItem, dropAction);
    
    // Create target area
    targetArea = {
      x: source.x,
      y: source.y,
      w: source.w,
      h: source.h
    };
  } else {
    // Not hovering over another item, calculate position based on drag delta
    const { x, y } = calculateDragPosition(
      startGrid,
      dragDeltaX,
      dragDeltaY,
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
  
  return {
    targetItem,
    targetArea,
    dropAction
  };
}

/**
 * Apply the drop operation to the layout
 */
export function applyDropOperation(
  layout: Layout[],
  draggedItemId: string,
  isResize: boolean,
  dropTarget?: DragTarget,
  originalItem?: Layout
): Layout[] {
  let newLayout = [...layout];
  const draggedItem = layout.find(item => item.i === draggedItemId);
  
  if (!draggedItem) return layout;
  
  if (!isResize && dropTarget) {
    const { targetItem, targetArea, dropAction } = dropTarget;
    
    if (targetItem && dropAction) {
      // We're dropping onto another item, use the calculated drop action
      
      // For swap actions, use the original item position if available
      if (dropAction.type === "swap" && originalItem) {
        // Create a custom swap that uses the original position
        return newLayout.map(item => {
          if (item.i === draggedItem.i) {
            // Move dragged item to target position
            return { 
              ...item, 
              x: targetItem.x, 
              y: targetItem.y, 
              w: targetItem.w, 
              h: targetItem.h 
            };
          }
          if (item.i === targetItem.i) {
            // Move target to original position
            return { 
              ...item, 
              x: originalItem.x, 
              y: originalItem.y, 
              w: originalItem.w, 
              h: originalItem.h 
            };
          }
          return item;
        });
      } else {
        // For non-swap actions, use the standard applyDropAction
        const { source, target } = applyDropAction(draggedItem, targetItem, dropAction);
        
        // Update the layout with new positions
        return newLayout.map(item => {
          if (item.i === draggedItem.i) {
            return { ...item, x: source.x, y: source.y, w: source.w, h: source.h };
          }
          if (item.i === targetItem.i) {
            return { ...item, x: target.x, y: target.y, w: target.w, h: target.h };
          }
          return item;
        });
      }
    } else {
      // Standard grid placement - use the target area
      return updateLayoutItem(newLayout, draggedItemId, {
        x: targetArea.x,
        y: targetArea.y
      });
    }
  }
  
  return newLayout;
}
