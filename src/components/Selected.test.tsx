/**
 * @jest-environment jsdom
 */

import * as React from "react";
import { render } from "@testing-library/react";
import context from "../state/context";
import { INITIAL_STATE } from "../state/reducer";
import Selected from "./Selected";

describe("<Selected />", () => {
  test("renders", () => {
    render(
      <context.Provider value={[INITIAL_STATE, jest.fn()]}>
        <Selected />
      </context.Provider>,
    );
  });
  expect(
    document.querySelector(
      ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--selected",
    ),
  );
});
