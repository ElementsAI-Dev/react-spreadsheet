import { useContextSelector } from "use-context-selector";
import * as Types from "../types";
import context from "./context";

function useSelector<T>(selector: (state: Types.StoreState) => T): T {
  return useContextSelector(context, ([state]) => selector(state));
}

export default useSelector;
