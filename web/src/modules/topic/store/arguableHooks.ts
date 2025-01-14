import { getClaimDiagramId } from "../utils/claim";
import { ArguableType } from "../utils/diagram";
import { useTopicStoreAfterHydration } from "./store";
import { getActiveDiagram } from "./utils";

export const useExplicitClaimCount = (arguableId: string, arguableType: ArguableType) => {
  const claimDiagramId = getClaimDiagramId(arguableId, arguableType);

  return useTopicStoreAfterHydration((state) => {
    const claimDiagram = state.diagrams[claimDiagramId];

    // consider setting noUncheckedIndexedAccess because this _can_ be undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (claimDiagram === undefined) return 0;

    // there's always one implicit claim (the root node)
    return claimDiagram.nodes.length - 1;
  });
};

export const useIsAnyArguableSelected = () => {
  return useTopicStoreAfterHydration((state) => {
    const activeDiagram = getActiveDiagram(state);
    return [...activeDiagram.nodes, ...activeDiagram.edges].some((arguable) => arguable.selected);
  });
};
