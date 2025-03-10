import { Layout } from '../types';

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

  // If source is too small to meaningfully split target, reject
  const minSize = 1; // Minimum grid units
  if (source.w < minSize && source.h < minSize) {
    return { type: "reject", reason: "Source too small to split target" };
  }

  // Calculate relative position of source center within target
  // Normalize to 0-1 range where (0,0) is top-left of target and (1,1) is bottom-right
  const sourceCenter = {
    x: source.x + source.w / 2,
    y: source.y + source.h / 2
  };
  
  const targetLeft = target.x;
  const targetTop = target.y;

  // Calculate normalized position (0-1) within target
  const normalizedX = (sourceCenter.x - targetLeft) / target.w;
  const normalizedY = (sourceCenter.y - targetTop) / target.h;
  
  // Divide target into 3x3 grid with proportions 25%, 50%, 25%
  // Horizontal sections: left (0-0.25), center (0.25-0.75), right (0.75-1)
  // Vertical sections: top (0-0.25), center (0.25-0.75), bottom (0.75-1)
  
  const isLeftSection = normalizedX < 0.25;
  const isRightSection = normalizedX > 0.75;
  const isTopSection = normalizedY < 0.25;
  const isBottomSection = normalizedY > 0.75;
  const isCenterXSection = !isLeftSection && !isRightSection;
  const isCenterYSection = !isTopSection && !isBottomSection;
  
  // Calculate new dimensions for split operations
  const newWidth = Math.max(1, Math.floor(target.w * 0.4));
  const newHeight = Math.max(1, Math.floor(target.h * 0.4));
  
  // Determine action based on which of the 9 sections the source is in
  
  // Center section - swap
  if (isCenterXSection && isCenterYSection) {
    return { type: "swap" };
  }
  
  // Left column
  if (isLeftSection) {
    if (isCenterYSection) {
      return { type: "placeLeft", newWidth };
    } else if (isTopSection) {
      return { type: "placeLeft", newWidth };
    } else { // Bottom-left
      return { type: "placeLeft", newWidth };
    }
  }
  
  // Right column
  if (isRightSection) {
    if (isCenterYSection) {
      return { type: "placeRight", newWidth };
    } else if (isTopSection) {
      return { type: "placeRight", newWidth };
    } else { // Bottom-right
      return { type: "placeRight", newWidth };
    }
  }
  
  // Top row (center column)
  if (isTopSection && isCenterXSection) {
    return { type: "placeTop", newHeight };
  }
  
  // Bottom row (center column)
  if (isBottomSection && isCenterXSection) {
    return { type: "placeBottom", newHeight };
  }
  
  // Fallback (should not reach here with the above conditions)
  return { type: "swap" };
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
        // For horizontal placement, ensure source is at least as tall as target
        // and align tops
        source: { 
          ...source, 
          x: target.x, 
          y: target.y, // Align top with target
          w: action.newWidth,
          h: source.h < target.h ? target.h : source.h 
        },
        target: { ...target, x: target.x + action.newWidth, w: target.w - action.newWidth },
      };

    case "placeRight":
      return {
        // For horizontal placement, ensure source is at least as tall as target
        // and align tops
        source: { 
          ...source, 
          x: target.x + target.w - action.newWidth,
          y: target.y, // Align top with target
          w: action.newWidth,
          h: source.h < target.h ? target.h : source.h 
        },
        target: { ...target, w: target.w - action.newWidth },
      };

    case "placeTop":
      return {
        // For vertical placement, ensure source is at least as wide as target
        // and align lefts
        source: { 
          ...source, 
          x: target.x, // Align left with target
          y: target.y, 
          h: action.newHeight,
          w: source.w < target.w ? target.w : source.w 
        },
        target: { ...target, y: target.y + action.newHeight, h: target.h - action.newHeight },
      };

    case "placeBottom":
      return {
        // For vertical placement, ensure source is at least as wide as target
        // and align lefts
        source: { 
          ...source, 
          x: target.x, // Align left with target
          y: target.y + target.h - action.newHeight, 
          h: action.newHeight,
          w: source.w < target.w ? target.w : source.w 
        },
        target: { ...target, h: target.h - action.newHeight },
      };

    case "reject":
      console.warn("Drop rejected:", action.reason);
      return { source, target };

    default:
      return { source, target };
  }
};
