import { Layout, WidgetType } from '../types';

// Check if two layout items collide
export const itemsCollide = (a: Layout, b: Layout): boolean => {
  if (a.i === b.i) return false; // Same element
  
  // Check if one rectangle is to the left of the other
  if (a.x + a.w <= b.x || b.x + b.w <= a.x) return false;
  
  // Check if one rectangle is above the other
  if (a.y + a.h <= b.y || b.y + b.h <= a.y) return false;
  
  return true; // Rectangles overlap
};

// Check if an item collides with any other items in layout
export const collidesWith = (layout: Layout[], item: Layout): Layout | null => {
  for (let i = 0; i < layout.length; i++) {
    if (itemsCollide(layout[i], item)) {
      return layout[i];
    }
  }
  return null;
};

// Get all items that would collide with the given item
export const getAllCollisions = (layout: Layout[], item: Layout): Layout[] => {
  return layout.filter(layoutItem => itemsCollide(layoutItem, item));
};

// Compact the layout vertically
export const compactLayout = (layout: Layout[]): Layout[] => {
  // Sort by y position
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

// Convert widgets to layout
export const widgetsToLayout = (widgets: WidgetType[]): Layout[] => {
  return widgets.map(widget => ({
    i: widget.id,
    x: widget.x,
    y: widget.y,
    w: widget.w,
    h: widget.h
  }));
};

// Convert layout back to widgets
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
