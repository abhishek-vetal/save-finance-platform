import { Inngest } from "inngest";

// created inngest client to work with the background/evnet-driven functions like recurring transactions
export const inngest = new Inngest({
  id: "save",
  name: "save",
});
