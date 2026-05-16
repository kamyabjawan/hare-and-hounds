import type { BoardPoint, BoardState, NodeId } from "./types";

export const BOARD_POINTS: BoardPoint[] = [
  { id: "L", x: 30, y: 120, label: "Left gate" },
  { id: "A1", x: 110, y: 40, label: "Upper left" },
  { id: "A2", x: 110, y: 120, label: "Center left" },
  { id: "A3", x: 110, y: 200, label: "Lower left" },
  { id: "B1", x: 200, y: 40, label: "Upper center" },
  { id: "B2", x: 200, y: 120, label: "Center" },
  { id: "B3", x: 200, y: 200, label: "Lower center" },
  { id: "C1", x: 290, y: 40, label: "Upper right" },
  { id: "C2", x: 290, y: 120, label: "Center right" },
  { id: "C3", x: 290, y: 200, label: "Lower right" },
  { id: "D", x: 370, y: 120, label: "Right gate" }
];

export const BOARD_POINT_MAP = new Map(BOARD_POINTS.map((point) => [point.id, point]));

export const INITIAL_BOARD_STATE: BoardState = {
  hare: "D",
  hounds: ["L", "A1", "A3"]
};

const undirectedEdges: [NodeId, NodeId][] = [
  ["L", "A1"],
  ["L", "A2"],
  ["L", "A3"],
  ["A1", "A2"],
  ["A2", "A3"],
  ["A1", "B1"],
  ["A2", "B2"],
  ["A3", "B3"],
  ["A1", "B2"],
  ["A2", "B1"],
  ["A2", "B3"],
  ["A3", "B2"],
  ["B1", "B2"],
  ["B2", "B3"],
  ["B1", "C1"],
  ["B2", "C2"],
  ["B3", "C3"],
  ["B1", "C2"],
  ["B2", "C1"],
  ["B2", "C3"],
  ["B3", "C2"],
  ["C1", "C2"],
  ["C2", "C3"],
  ["C1", "D"],
  ["C2", "D"],
  ["C3", "D"]
];

export const BOARD_EDGES = undirectedEdges;

export const ADJACENCY: Record<NodeId, NodeId[]> = undirectedEdges.reduce(
  (acc, [from, to]) => {
    acc[from].push(to);
    acc[to].push(from);
    return acc;
  },
  {
    L: [],
    A1: [],
    A2: [],
    A3: [],
    B1: [],
    B2: [],
    B3: [],
    C1: [],
    C2: [],
    C3: [],
    D: []
  } satisfies Record<NodeId, NodeId[]>
);

export function pointFor(node: NodeId) {
  const point = BOARD_POINT_MAP.get(node);

  if (!point) {
    throw new Error(`Unknown board node: ${node}`);
  }

  return point;
}

export function nodeX(node: NodeId) {
  return pointFor(node).x;
}
