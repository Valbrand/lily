import parinfer = require("parinfer");
import { ParinferEngine } from "../../parinfer";

export function createParinferEngine(): ParinferEngine {
  return parinfer;
}
