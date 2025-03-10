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
