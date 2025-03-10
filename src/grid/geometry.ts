import { Layout } from '../types';

/**
 * Check if two rectangles overlap
 */
export const rectanglesOverlap = (
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number }
): boolean => {
  // Check if one rectangle is to the left of the other
  if (r1.x + r1.w <= r2.x || r2.x + r2.w <= r1.x) return false;
  
  // Check if one rectangle is above the other
  if (r1.y + r1.h <= r2.y || r2.y + r2.h <= r1.y) return false;
  
  return true; // Rectangles overlap
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Convert pixel delta to grid units
 */
export const pixelToGrid = (pixelDelta: number, gridSize: number): number => {
  return Math.round(pixelDelta / gridSize);
};

/**
 * Calculate the maximum y-coordinate in the layout
 */
export const getLayoutHeight = (layout: Layout[]): number => {
  if (layout.length === 0) return 0;
  return Math.max(...layout.map(item => item.y + item.h));
};

/**
 * Calculate new position for dragging
 */
export const calculateDragPosition = (
  startGrid: { x: number; y: number },
  deltaX: number,
  deltaY: number,
  colWidth: number,
  rowHeight: number,
  cols: number
): { x: number; y: number } => {
  const gridDeltaX = pixelToGrid(deltaX, colWidth);
  const gridDeltaY = pixelToGrid(deltaY, rowHeight);
  return {
    x: clamp(startGrid.x + gridDeltaX, 0, cols - 1),
    y: Math.max(0, startGrid.y + gridDeltaY)
  };
};

/**
 * Calculate new size for resizing
 */
export const calculateResizeSize = (
  startSize: { w: number; h: number },
  deltaX: number,
  deltaY: number,
  colWidth: number,
  rowHeight: number,
  minW: number = 1,
  minH: number = 1
): { w: number; h: number } => {
  const gridDeltaW = pixelToGrid(deltaX, colWidth);
  const gridDeltaH = pixelToGrid(deltaY, rowHeight);
  
  return {
    w: Math.max(minW, startSize.w + gridDeltaW),
    h: Math.max(minH, startSize.h + gridDeltaH)
  };
};

/**
 * Handles widget resize with collision detection and adjustment
 * 
 * When a widget is resized and would overlap with adjacent widgets:
 * - For horizontal resize: moves widgets to the right and adjusts their width
 * - For vertical resize: moves widgets below and adjusts their height
 */
export const handleResizeWithCollisions = (
  layout: Layout[],
  itemId: string,
  newW: number,
  newH: number,
  originalItem: Layout
): Layout[] => {
  const updatedLayout = [...layout];
  const resizingItem = updatedLayout.find(item => item.i === itemId);
  
  if (!resizingItem) return updatedLayout;
  
  // Store original dimensions
  const originalW = originalItem.w;
  const originalH = originalItem.h;
  
  // Calculate deltas
  const deltaW = newW - originalW;
  const deltaH = newH - originalH;
  
  // Only proceed if we're growing the widget
  if (deltaW <= 0 && deltaH <= 0) {
    resizingItem.w = newW;
    resizingItem.h = newH;
    return updatedLayout;
  }
  
  // Apply the new size to the resizing item
  resizingItem.w = newW;
  resizingItem.h = newH;
  
  // Create a temporary layout with the resized item
  const tempLayout = updatedLayout.map(item => 
    item.i === itemId ? resizingItem : item
  );
  
  // Find all items that now collide with the resized item
  const collisions = getAllCollisions(tempLayout, resizingItem)
    .filter(item => item.i !== itemId);
  
  if (collisions.length === 0) {
    // No collisions, just return the updated layout
    return updatedLayout;
  }
  
  // Handle horizontal resize collisions
  if (deltaW > 0) {
    // Find items to the right that need to be moved
    const itemsToRight = collisions.filter(item => 
      item.x >= originalItem.x + originalW
    );
    
    // Move items to the right
    itemsToRight.forEach(item => {
      const index = updatedLayout.findIndex(i => i.i === item.i);
      if (index !== -1) {
        updatedLayout[index] = {
          ...updatedLayout[index],
          x: updatedLayout[index].x + deltaW
        };
      }
    });
  }
  
  // Handle vertical resize collisions
  if (deltaH > 0) {
    // Find items below that need to be moved
    const itemsBelow = collisions.filter(item => 
      item.y >= originalItem.y + originalH
    );
    
    // Move items below
    itemsBelow.forEach(item => {
      const index = updatedLayout.findIndex(i => i.i === item.i);
      if (index !== -1) {
        updatedLayout[index] = {
          ...updatedLayout[index],
          y: updatedLayout[index].y + deltaH
        };
      }
    });
  }
  
  return updatedLayout;
};
