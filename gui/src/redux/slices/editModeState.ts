import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessageContent } from "core";
import { RangeInFileWithContents } from "core/commands/util";
import { EditStatus } from "core/protocol/ideWebview";

interface EditModeState {
  editStatus: EditStatus;
  previousInputs: MessageContent[];
  fileAfterEdit?: string;
  codeToEdit: RangeInFileWithContents[];
}

const initialState: EditModeState = {
  editStatus: "not-started",
  previousInputs: [],
  codeToEdit: [],
};

export const editModeStateSlice = createSlice({
  name: "editModeState",
  initialState,
  reducers: {
    addRIFToCodeToEdit: (
      state,
      { payload }: PayloadAction<RangeInFileWithContents>,
    ) => {
      state.codeToEdit.push(payload);
      state.editStatus = "not-started";
      state.previousInputs = [];
      state.fileAfterEdit = undefined;
    },
    focusEdit: (state) => {
      state.editStatus = "not-started";
      state.previousInputs = [];
      state.fileAfterEdit = undefined;
    },
    submitEdit: (state, { payload }: PayloadAction<MessageContent>) => {
      state.previousInputs.push(payload);
      state.editStatus = "streaming";
    },
    removeEntryFromCodeToEdit: (
      state,
      { payload }: PayloadAction<RangeInFileWithContents>,
    ) => {
      state.codeToEdit = state.codeToEdit.filter(
        (entry) => entry.toString() !== payload.toString(),
      );
    },
    setEditStatus: (
      state,
      {
        payload,
      }: PayloadAction<{ status: EditStatus; fileAfterEdit?: string }>,
    ) => {
      // Only allow valid transitions
      const currentStatus = state.editStatus;
      if (currentStatus === "not-started" && payload.status === "streaming") {
        state.editStatus = payload.status;
      } else if (
        currentStatus === "streaming" &&
        payload.status === "accepting"
      ) {
        state.editStatus = payload.status;
        state.fileAfterEdit = payload.fileAfterEdit;
      } else if (currentStatus === "accepting" && payload.status === "done") {
        state.editStatus = payload.status;
      } else if (
        currentStatus === "accepting:full-diff" &&
        payload.status === "done"
      ) {
        state.editStatus = payload.status;
      } else if (
        currentStatus === "accepting" &&
        payload.status === "accepting:full-diff"
      ) {
        state.editStatus = payload.status;
      } else if (
        currentStatus === "accepting:full-diff" &&
        payload.status === "accepting"
      ) {
        state.editStatus = payload.status;
      } else if (currentStatus === "done" && payload.status === "not-started") {
        state.editStatus = payload.status;
      }
    },
    addPreviousInput: (state, { payload }: PayloadAction<MessageContent>) => {
      state.previousInputs.push(payload);
    },
    setEditDone: (state) => {
      state.editStatus = "done";
      state.previousInputs = [];
    },
  },
});

export const {
  addRIFToCodeToEdit,
  setEditStatus,
  addPreviousInput,
  setEditDone,
  submitEdit,
  removeEntryFromCodeToEdit,
  focusEdit,
} = editModeStateSlice.actions;
export default editModeStateSlice.reducer;
