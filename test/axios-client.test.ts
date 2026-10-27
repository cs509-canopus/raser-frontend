import { backend } from "../src/axios-client";

test("BACKEND_BASE_URL is set", () => {
  const apiEndpoint = process.env.BACKEND_BASE_URL;
  expect(apiEndpoint).toBeDefined();
});

test("Test connection to the currently configured API Endpoint", async () => {
  const apiEndpoint = process.env.BACKEND_BASE_URL;
  console.log(`Using backend URL: ${apiEndpoint}`);

  const response = await backend.options("");
  expect(response.status).toBe(204);
});
