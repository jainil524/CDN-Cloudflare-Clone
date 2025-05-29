import { Router } from "express";

const fsmrouter = Router();

// ───────────────────────────────────────────────
// ✅ Health / Status
fsmrouter.get("/", (req, res) => {
  res.status(200).json({ message: "FSM Service is running" });
});

fsmrouter.get("/status", (req, res) => {
  res.status(200).json({ status: "FSM Service is operational" });
});


export default fsmrouter;
