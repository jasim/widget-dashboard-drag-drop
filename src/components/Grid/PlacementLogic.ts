/**
 * Drag-and-Drop Placement Logic
 *
 * This module separates **decision making** (what action to take)
 * from **computation** (how to modify elements accordingly).
 *
 * Decision Function: `decideDropAction(source, target)`
 *    - Determines the correct action (swap, split, place, etc.)
 *
 * Computation Function: `applyDropAction(source, target, action)`
 *    - Computes new positions and sizes based on the action.
 *
 * This enables UI previews before committing to the final state.
 */

type Position = { x: number; y: number };
type Size = { width: number; height: number };
type Rect = Position & Size;

/**
 *  Defines possible drop actions semantically.
 */
type DropAction =
  | { type: "swap" }
  | { type: "placeLeft"; newWidth: number }
  | { type: "placeRight"; newWidth: number }
  | { type: "placeTop"; newHeight: number }
  | { type: "placeBottom"; newHeight: number }
  | { type: "reject"; reason: string };

/**
 * Determines the best action to take when dropping `source` onto `target`.
 *
 * This function **does not modify** elements—it only decides **what should happen**.
 *
 * @param source - The element being dragged.
 * @param target - The element being overlapped.
 * @returns A `DropAction` describing what should happen.
 */
function decideDropAction(source: Rect, target: Rect): DropAction {
  const overlapX = (source.x + source.width / 2) - (target.x + target.width / 2);
  const overlapY = (source.y + source.height / 2) - (target.y + target.height / 2);
  const absOverlapX = Math.abs(overlapX);
  const absOverlapY = Math.abs(overlapY);

  // If source is larger, swap
  if (source.width >= target.width && source.height >= target.height) {
    return { type: "swap" };
  }

  // If source is too small to meaningfully split target, reject
  const minSize = 50;
  if (source.width < minSize && source.height < minSize) {
    return { type: "reject", reason: "Source too small to split target" };
  }

  // Determine placement direction
  const isHorizontal = absOverlapX > absOverlapY;

  if (isHorizontal) {
    if (overlapX < 0) {
      return { type: "placeLeft", newWidth: target.width * (source.width / target.width) };
    } else {
      return { type: "placeRight", newWidth: target.width * (source.width / target.width) };
    }
  } else {
    if (overlapY < 0) {
      return { type: "placeTop", newHeight: target.height * (source.height / target.height) };
    } else {
      return { type: "placeBottom", newHeight: target.height * (source.height / target.height) };
    }
  }
}

/**
 * Computes the new state after applying a drop action.
 *
 * This function **modifies** positions & sizes based on the action.
 *
 * @param source - The element being dragged.
 * @param target - The element being overlapped.
 * @param action - The action decided by `decideDropAction`.
 * @returns The new positions & sizes for source and target.
 */
function applyDropAction(source: Rect, target: Rect, action: DropAction): { source: Rect; target: Rect } {
  switch (action.type) {
    case "swap":
      return {
        source: { ...target },
        target: { ...source },
      };

    case "placeLeft":
      return {
        source: { ...source, x: target.x, width: action.newWidth },
        target: { ...target, x: target.x + action.newWidth, width: target.width - action.newWidth },
      };

    case "placeRight":
      return {
        source: { ...source, x: target.x + target.width - action.newWidth, width: action.newWidth },
        target: { ...target, width: target.width - action.newWidth },
      };

    case "placeTop":
      return {
        source: { ...source, y: target.y, height: action.newHeight },
        target: { ...target, y: target.y + action.newHeight, height: target.height - action.newHeight },
      };

    case "placeBottom":
      return {
        source: { ...source, y: target.y + target.height - action.newHeight, height: action.newHeight },
        target: { ...target, height: target.height - action.newHeight },
      };

    case "reject":
      console.warn("Drop rejected:", action.reason);
      return { source, target };

    default:
      return { source, target };
  }
}

/**
 * Example usage:
 */
const source: Rect = { x: 50, y: 50, width: 80, height: 40 };
const target: Rect = { x: 100, y: 100, width: 200, height: 100 };

const action = decideDropAction(source, target);
console.log("Decided Action:", action);

const updatedRects = applyDropAction(source, target, action);
console.log("Updated Positions:", updatedRects);
