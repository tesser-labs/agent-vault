import { z } from "zod";

export const JsonRpcVersionSchema = z.literal("2.0");

export const JsonRpcIdSchema = z.union([z.number(), z.string(), z.null()]);

export const JsonRpcRequestSchema = z.object({
  jsonrpc: JsonRpcVersionSchema,
  method: z.string(),
  params: z.any().optional(),
  id: JsonRpcIdSchema,
});

export const JsonRpcResponseSchema = z.object({
  jsonrpc: JsonRpcVersionSchema,
  result: z.any().optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      data: z.any().optional(),
    })
    .optional(),
  id: JsonRpcIdSchema,
});

export type JsonRpcVersion = z.infer<typeof JsonRpcVersionSchema>;
export type JsonRpcId = z.infer<typeof JsonRpcIdSchema>;
export type JsonRpcRequest = z.infer<typeof JsonRpcRequestSchema>;
export type JsonRpcResponse = z.infer<typeof JsonRpcResponseSchema>;

export interface Transport {
  read(): Promise<string>;
  write(data: string): Promise<void>;
}
