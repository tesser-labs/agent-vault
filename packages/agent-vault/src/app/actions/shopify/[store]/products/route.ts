export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getTokenStorageKey } from "@/cache/session";
import tokenStore from "@/cache/token";
import { getAuthEndpoint } from "@/authProviders";
import { UnAuthorizedResponse } from "@/app/responses";

const toolMetadata = { provider: "shopify", service: "products" };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ store: string }> }
) {
  try {
    const { store } = await params;
    const searchParams = req.nextUrl.searchParams;
    const adid = searchParams.get("adid") || undefined;
    const resource = store;
    /*
    if (!udid) {
      return new Response(JSON.stringify({ error: "udid is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    */
    if (!store) {
      return new Response(JSON.stringify({ error: "store is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // check if user already has a token
    // TODO: add agent authentication to retrieve Agent ID and name
    const agentName = adid;
    const tokenStorageKey = getTokenStorageKey({
      agentName,
      provider: toolMetadata.provider,
      resource,
      service: toolMetadata.service,
    });

    const tokens = await tokenStore.get(tokenStorageKey);
    if (
      !tokens ||
      !tokens.access_token ||
      (tokens.expiry_date && tokens.expiry_date < Date.now())
    ) {
      const authEndpoint = getAuthEndpoint({
        provider: toolMetadata.provider,
      }).toString();
      return new UnAuthorizedResponse({ authEndpoint });
    }
    const { access_token } = tokens;

    const first = searchParams.get("first") || "20";
    const query = searchParams.get("query") || "";
    const cursor = searchParams.get("cursor") || null;

    // Construct GraphQL query
    const graphqlQuery = {
      query: `
        query GetProducts($first: Int!, $query: String, $after: String) {
          products(first: $first, query: $query, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              cursor
              node {
                id
                title
                handle
                description
                status
                totalInventory
                createdAt
                updatedAt
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 5) {
                  edges {
                    node {
                      id
                      title
                      sku
                      price
                      inventoryQuantity
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        first: parseInt(first),
        query: query,
        after: cursor,
      },
    };

    // Make request to Shopify
    const response = await fetch(
      `https://${store}.myshopify.com/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": access_token,
        },
        body: JSON.stringify(graphqlQuery),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API responded with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
