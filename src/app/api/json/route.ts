import { exec } from "child_process";
import { NextRequest } from "next/server";
import { z, ZodTypeAny } from "zod";

//  string, boolean, number

const determineSchemaType = (schema: any) => {
  if (!schema.hasOwnProperty("type")) {
    if (Array.isArray(schema)) {
      return "array";
    } else {
      return typeof schema;
    }
  }
  return schema.type;
};

const jsonSchemaToZod = (schema: any) => {
  const type = determineSchemaType(schema);

  switch (type) {
    case "string":
      return z.string().nullable();
    case "number":
      return z.number().nullable();
    case "boolean":
      return z.boolean().nullable();
    case "array":
      return z.array(jsonSchemaToZod(schema.items)).nullable();
    case "object":
      const shape: Record<string, ZodTypeAny> = {};

      for (const key in schema) {
        if (key !== "type") {
          shape[key] = jsonSchemaToZod(schema[key]);
        }
      }

      return z.object(shape);

    default:
      throw new Error(`Unsupported data type: ${type}`);
  }
};

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

  //3. Retry mechanism

  type PromiseExecutor<T> = (
    resolve: (value: T) => void,
    reject: (reason?: any) => void
  ) => void;

  class RetryablePromise<T> extends Promise<T> {
    static async retry<T>(
      retries: number,
      executor: PromiseExecutor<T>
    ): Promise<T> {
      return new RetryablePromise(executor).catch((error) => {
        console.error(`Retrying due to error: ${error}`);

        return retries > 0
          ? RetryablePromise.retry(retries - 1, executor)
          : RetryablePromise.reject(error);
      });
    }
  }

  const idk = RetryablePromise.retry(5, (resolve, reject) => {
    try {
    } catch (err) {}
  });

  return new Response("OK");
};
