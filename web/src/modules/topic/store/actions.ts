import { type EdgeSelectionChange, type NodeSelectionChange } from "reactflow";

import { getClaimDiagramId, getRootArguable } from "../utils/claim";
import {
  ArguableType,
  Diagram,
  Score,
  findArguable,
  findNode,
  problemDiagramId,
} from "../utils/diagram";
import { useTopicStore } from "./store";
import { getActiveDiagram, getDuplicateState } from "./utils";

// score setting is way more work than it needs to be because one score can live in multiple places:
// - on the arguable
// - on the parent arguable (if this is a RootClaim)
// - on the child/implicit root claim (if it exists)
// keeping this in sync manually ain't great.
// TODO: store scores in one place
export const setScore = (arguableId: string, arguableType: ArguableType, score: Score) => {
  const state = getDuplicateState();

  // update this node's score
  const activeDiagram = getActiveDiagram(state);
  const arguable = findArguable(arguableId, arguableType, activeDiagram);
  /* eslint-disable functional/immutable-data, no-param-reassign */
  arguable.data.score = score;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // update parent arguable's score if this is a RootClaim
  if (arguable.type === "rootClaim") {
    // assuming we won't support nested root claims, so parent will always be root
    const parentArguable = getRootArguable(activeDiagram.id, state.diagrams[problemDiagramId]);
    /* eslint-disable functional/immutable-data, no-param-reassign */
    parentArguable.data.score = score;
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  // update implicit child claim's score if it exists
  const childDiagramId = getClaimDiagramId(arguableId, arguableType);
  if (getDiagram(childDiagramId)) {
    const childDiagram = state.diagrams[childDiagramId];
    const childClaim = childDiagram.nodes.find((node) => node.type === "rootClaim");
    if (!childClaim) throw new Error("child claim not found");

    /* eslint-disable functional/immutable-data, no-param-reassign */
    childClaim.data.score = score;
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  useTopicStore.setState(state, false, "setScore");
};

export const getDiagram = (diagramId: string) => {
  return useTopicStore.getState().diagrams[diagramId] as Diagram | undefined;
};

export const setNodeLabel = (nodeId: string, value: string) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);
  const node = findNode(nodeId, activeDiagram);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  node.data.label = value;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "setNodeLabel");
};

export const setSelected = (
  selectChanges: NodeSelectionChange[] | EdgeSelectionChange[],
  arguableType: ArguableType
) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);

  selectChanges.forEach((selectChange) => {
    const arguable = findArguable(selectChange.id, arguableType, activeDiagram);

    /* eslint-disable functional/immutable-data, no-param-reassign */
    arguable.selected = selectChange.selected;
    /* eslint-enable functional/immutable-data, no-param-reassign */
  });

  useTopicStore.setState(state, false, "setSelected");
};

export const setSelectedArguable = (arguableId: string, arguableType: ArguableType) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = activeDiagram.nodes.map((node) => ({ ...node, selected: false }));
  activeDiagram.edges = activeDiagram.edges.map((edge) => ({ ...edge, selected: false }));
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const arguable = findArguable(arguableId, arguableType, activeDiagram);
  /* eslint-disable functional/immutable-data, no-param-reassign */
  arguable.selected = true;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "setSelectedArguable");
};
