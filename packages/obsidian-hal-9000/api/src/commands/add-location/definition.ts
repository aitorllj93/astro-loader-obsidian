import { z } from "zod";

const definition = {
  name: "add-location",
  description: "Tool to add locations to the knowledge base.",
  input: {
    name: z.string(),
		path: z.string().optional(),
		entry: z.string().optional(),
  },
  output: {
    content: z.string(),
  }
};

export default definition;
