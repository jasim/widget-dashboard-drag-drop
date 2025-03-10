import { Layout, WidgetType } from '../types';

// Pure geometry functions
// -----------------------

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

// Layout-specific functions
// ------------------------

/**
 * Check if two layout items collide
 */
export const itemsCollide = (a: Layout, b: Layout): boolean => {
  if (a.i === b.i) return false; // Same element
  return rectanglesOverlap(a, b);
};

/**
 * Check if an item collides with any other items in layout
 */
export const collidesWith = (layout: Layout[], item: Layout): Layout | null => {
  for (let i = 0; i < layout.length; i++) {
    if (itemsCollide(layout[i], item)) {
      return layout[i];
    }
  }
  return null;
};

/**
 * Get all items that would collide with the given item
 */
export const getAllCollisions = (layout: Layout[], item: Layout): Layout[] => {
  return layout.filter(layoutItem => itemsCollide(layoutItem, item));
};

/**
 * Compact the layout vertically
 */
export const compactLayout = (layout: Layout[]): Layout[] => {
  // Sort by y position, then x position for stability
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
  const compacted = Array(layout.length);
  
  for (let i = 0; i < sorted.length; i++) {
    let item = { ...sorted[i] };
    
    // Move the element up as far as it can go without colliding
    item.y = 0;
    
    while (item.y < sorted.length) {
      const collisionItem = collidesWith(
        compacted.filter(Boolean),
        item
      );
      
      if (collisionItem) {
        // Move below the collision
        item.y = collisionItem.y + collisionItem.h;
      } else {
        break;
      }
    }
    
    compacted[i] = item;
  }
  
  return compacted;
};

/**
 * Calculate the maximum y-coordinate in the layout
 */
export const getLayoutHeight = (layout: Layout[]): number => {
  if (layout.length === 0) return 0;
  return Math.max(...layout.map(item => item.y + item.h));
};

// Widget-Layout conversion functions
// ---------------------------------

/**
 * Convert widgets to layout
 */
export const widgetsToLayout = (widgets: WidgetType[]): Layout[] => {
  return widgets.map(widget => ({
    i: widget.id,
    x: widget.x,
    y: widget.y,
    w: widget.w,
    h: widget.h
  }));
};

/**
 * Convert layout back to widgets
 */
export const layoutToWidgets = (widgets: WidgetType[], layout: Layout[]): WidgetType[] => {
  return widgets.map(widget => {
    const layoutItem = layout.find(item => item.i === widget.id);
    if (layoutItem) {
      return {
        ...widget,
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h
      };
    }
    return widget;
  });
};

// Grid operations
// --------------

/**
 * Update a single item in the layout
 */
export const updateLayoutItem = (
  layout: Layout[], 
  itemId: string, 
  updates: Partial<Layout>
): Layout[] => {
  return layout.map(item => 
    item.i === itemId ? { ...item, ...updates } : item
  );
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
