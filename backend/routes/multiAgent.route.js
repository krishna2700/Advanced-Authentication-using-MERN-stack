import express from "express";

const router = express.Router();

const page = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Multi-Agent Selector</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: "Inter", system-ui, sans-serif;
      }
      body {
        margin: 0;
        padding: 48px 24px;
        display: flex;
        justify-content: center;
        background: #0f172a;
        color: #e2e8f0;
      }
      .card {
        width: min(520px, 100%);
        background: #111827;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.4);
      }
      h1 {
        margin: 0 0 16px;
        font-size: 24px;
      }
      p {
        margin: 0 0 24px;
        color: #94a3b8;
      }
      .buttons {
        display: flex;
        gap: 16px;
      }
      .agent-button {
        flex: 1;
        border: 1px solid transparent;
        border-radius: 12px;
        padding: 16px;
        background: #1f2937;
        color: #e2e8f0;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .agent-button:hover {
        border-color: #38bdf8;
        transform: translateY(-1px);
      }
      .agent-button.active {
        background: #0ea5e9;
        border-color: #7dd3fc;
        color: #0f172a;
        font-weight: 600;
      }
      .status {
        margin-top: 20px;
        padding: 12px 16px;
        background: #0f172a;
        border-radius: 12px;
        color: #e2e8f0;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Multi-Agent Selector</h1>
      <p>Select the agent you want to use right now.</p>
      <div class="buttons">
        <button class="agent-button" data-agent="claude">Claude</button>
        <button class="agent-button" data-agent="codex">Codex</button>
      </div>
      <div class="status" id="status">No agent selected.</div>
    </main>
    <script>
      const buttons = document.querySelectorAll(".agent-button");
      const status = document.getElementById("status");
      const stored = localStorage.getItem("selectedAgent");

      const setActive = (agent) => {
        buttons.forEach((button) => {
          const isActive = button.dataset.agent === agent;
          button.classList.toggle("active", isActive);
        });
        status.textContent = agent
          ? `Selected agent: ${agent.charAt(0).toUpperCase() + agent.slice(1)}`
          : "No agent selected.";
      };

      if (stored) {
        setActive(stored);
      }

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const agent = button.dataset.agent;
          localStorage.setItem("selectedAgent", agent);
          setActive(agent);
        });
      });
    </script>
  </body>
</html>`;

router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(page);
});

export default router;
