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
 * Defines possible drop actions semantically.
 */
export type DropAction =
  | { type: "swap" }
  | { type: "placeLeft"; newWidth: number }
  | { type: "placeRight"; newWidth: number }
  | { type: "placeTop"; newHeight: number }
  | { type: "placeBottom"; newHeight: number }
  | { type: "reject"; reason: string };

/**
 * Determines the best action to take when dropping source onto target.
 *
 * This function does not modify elements—it only decides what should happen.
 * It assumes source and target are different items (source.i !== target.i).
 */
export const decideDropAction = (
  source: Layout,
  target: Layout
): DropAction => {
  // Safety check - if somehow the same item is passed as source and target
  if (source.i === target.i) {
    return { type: "reject", reason: "Cannot place an item onto itself" };
  }
  const overlapX = (source.x + source.w / 2) - (target.x + target.w / 2);
  const overlapY = (source.y + source.h / 2) - (target.y + target.h / 2);
  const absOverlapX = Math.abs(overlapX);
  const absOverlapY = Math.abs(overlapY);

  // If source is larger, swap
  if (source.w >= target.w && source.h >= target.h) {
    return { type: "swap" };
  }

  // If source is too small to meaningfully split target, reject
  const minSize = 1; // Minimum grid units
  if (source.w < minSize && source.h < minSize) {
    return { type: "reject", reason: "Source too small to split target" };
  }

  // Determine placement direction
  const isHorizontal = absOverlapX > absOverlapY;

  if (isHorizontal) {
    if (overlapX < 0) {
      return { type: "placeLeft", newWidth: Math.max(1, Math.floor(target.w * 0.4)) };
    } else {
      return { type: "placeRight", newWidth: Math.max(1, Math.floor(target.w * 0.4)) };
    }
  } else {
    if (overlapY < 0) {
      return { type: "placeTop", newHeight: Math.max(1, Math.floor(target.h * 0.4)) };
    } else {
      return { type: "placeBottom", newHeight: Math.max(1, Math.floor(target.h * 0.4)) };
    }
  }
};

/**
 * Computes the new state after applying a drop action.
 */
export const applyDropAction = (
  source: Layout,
  target: Layout,
  action: DropAction
): { source: Layout; target: Layout } => {
  // Safety check - if somehow the same item is passed as source and target
  if (source.i === target.i) {
    console.warn("Cannot apply drop action on the same item");
    return { source, target };
  }
  switch (action.type) {
    case "swap":
      return {
        source: { 
          ...source,
          x: target.x,
          y: target.y,
          w: target.w,
          h: target.h
        },
        target: {
          ...target,
          x: source.x,
          y: source.y,
          w: source.w,
          h: source.h
        },
      };

    case "placeLeft":
      return {
        source: { ...source, x: target.x, w: action.newWidth },
        target: { ...target, x: target.x + action.newWidth, w: target.w - action.newWidth },
      };

    case "placeRight":
      return {
        source: { ...source, x: target.x + target.w - action.newWidth, w: action.newWidth },
        target: { ...target, w: target.w - action.newWidth },
      };

    case "placeTop":
      return {
        source: { ...source, y: target.y, h: action.newHeight },
        target: { ...target, y: target.y + action.newHeight, h: target.h - action.newHeight },
      };

    case "placeBottom":
      return {
        source: { ...source, y: target.y + target.h - action.newHeight, h: action.newHeight },
        target: { ...target, h: target.h - action.newHeight },
      };

    case "reject":
      console.warn("Drop rejected:", action.reason);
      return { source, target };

    default:
      return { source, target };
  }
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
  console.log(gridDeltaX, "gridDeltaX")
  console.log(gridDeltaY, "gridDeltaY")
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
