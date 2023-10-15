import assert from "node:assert";
import test from "node:test";

import maddy from "maddy-dist"

test("Server startup", async () => {
  const server = await maddy()
  server.stop();
})
