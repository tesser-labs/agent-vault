import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json([
    {
      provider: "shopify",
      tools: [
        {
          name: "getProducts",
          description: "Get all products from the shopify store",
          parameters: {
            store: {
              type: "string",
              description: "The store name",
            },
          },
        },
      ],
    },
  ]);
}
