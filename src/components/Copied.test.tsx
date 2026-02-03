/**
 * @jest-environment jsdom
 */

import * as React from "react";
import { render } from "@testing-library/react";
import context from "../state/context";
import { INITIAL_STATE } from "../state/reducer";
import Copied from "./Copied";

describe("<Copied />", () => {
  test("renders", () => {
    render(
      <context.Provider value={[INITIAL_STATE, jest.fn()]}>
        <Copied />
      </context.Provider>,
    );
  });
  expect(
    document.querySelector(
      ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--copied",
    ),
  );
});
