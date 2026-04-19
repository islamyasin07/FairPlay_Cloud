import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`FairPlay Cloud backend running on http://localhost:${env.port}`);
});