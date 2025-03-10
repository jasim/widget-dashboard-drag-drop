import { Layout, WidgetType } from '../types';
import { rectanglesOverlap, getLayoutHeight } from '../grid/geometry';
import { itemsCollide, collidesWith, getAllCollisions, compactLayout, updateLayoutItem, widgetsToLayout, layoutToWidgets } from '../grid/layout';
import { decideDropAction, applyDropAction } from '../grid/placement';
import { clamp, pixelToGrid, calculateDragPosition, calculateResizeSize } from '../grid/geometry';

// Re-export all the functions from our new modules
// This maintains backward compatibility with existing code
export {
  rectanglesOverlap,
  decideDropAction,
  applyDropAction,
  clamp,
  pixelToGrid,
  itemsCollide,
  collidesWith,
  getAllCollisions,
  compactLayout,
  getLayoutHeight,
  widgetsToLayout,
  layoutToWidgets,
  updateLayoutItem,
  calculateDragPosition,
  calculateResizeSize
};

// Export types for backward compatibility
export type { DropAction } from '../grid/placement';
