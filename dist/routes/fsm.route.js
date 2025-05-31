"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fsmrouter = (0, express_1.Router)();
const fsm_controller_1 = require("@/FSM/controller/fsm.controller");
fsmrouter.get("/", (req, res) => {
    res.status(200).json({ message: "FSM Service is running" });
});
fsmrouter.get("/status", (req, res) => {
    res.status(200).json({ status: "FSM Service is operational" });
});
fsmrouter.get("/getProjectId", fsm_controller_1.getProjectId);
fsmrouter.get("/getDetails", fsm_controller_1.getDetails);
fsmrouter.post("/createProject", fsm_controller_1.createProject);
fsmrouter.delete("/deleteProject/:workspaceId/:projectId", fsm_controller_1.deleteProject);
fsmrouter.post("/addFileToProject", fsm_controller_1.addFileToProject);
fsmrouter.delete("/deleteFileFromProject/:workspaceId/:projectId/:fileId", fsm_controller_1.deleteFileFromProject);
exports.default = fsmrouter;
