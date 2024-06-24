import { NextRequest } from "next/server";
import { z } from "zod";

const jsonSchemaToZod = (schema: any) => {};

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  // 1. Ensure incoming request is valid
  const genericSchema = z.object({
    data: z.string(),
    format: z.object({}).passthrough(),
  });

  const { data, format } = genericSchema.parse(body);

  // 2. Create a schema from the expected user format
  const dynamicSchema = jsonSchemaToZod(format);

  return new Response("OK");
};
