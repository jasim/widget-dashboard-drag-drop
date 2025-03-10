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
