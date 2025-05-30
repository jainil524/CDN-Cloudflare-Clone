import { Router } from "express";

const fsmrouter = Router();

import {
  getProjectId,
  getDetails,
  createProject,
  deleteProject,
  addFileToProject,
  deleteFileFromProject,
} from "@/FSM/controller/fsm.controller";


fsmrouter.get("/", (req, res) => {
  res.status(200).json({ message: "FSM Service is running" });
});

fsmrouter.get("/status", (req, res) => {
  res.status(200).json({ status: "FSM Service is operational" });
});

fsmrouter.get("/getProjectId", getProjectId);
fsmrouter.get("/getDetails", getDetails);
fsmrouter.post("/createProject", createProject);
fsmrouter.delete("/deleteProject/:workspaceId/:projectId", deleteProject);
fsmrouter.post("/addFileToProject", addFileToProject);
fsmrouter.delete("/deleteFileFromProject/:workspaceId/:projectId/:fileId", deleteFileFromProject);




export default fsmrouter;
