import type { SimObjectType } from "../types/sim";

export type SelectionRef = {
  id: string | null;
  type: SimObjectType | null;
};

export function isSelectionMatch(
  selection: SelectionRef,
  id: string,
  type: SimObjectType,
): boolean {
  return selection.id === id && selection.type === type;
}

export function formatSelectionDebug(selection: SelectionRef): string {
  if (!selection.id || !selection.type) {
    return "none";
  }
  return `${selection.type}:${selection.id}`;
}

