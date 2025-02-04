import { NextRequest, NextResponse } from "next/server";
import { getTokenStorageKey } from "@/cache/session";
import tokenStore from "@/cache/token";

const PROVIDER = "shopify";

// GET handler to fetch orders
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ store: string }> }
) {
  try {
    const { store } = await params;
    const searchParams = req.nextUrl.searchParams;
    const udid = searchParams.get("udid");
    if (!udid) {
      return new Response(JSON.stringify({ error: "udid is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    // check if user already has a token
    const tokenStorageKey = getTokenStorageKey(udid as string, PROVIDER, store);
    const tokens = await tokenStore.get(tokenStorageKey);
    if (!tokens || !tokens.access_token) {
      return new Response(JSON.stringify({ error: "No access token found" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    const { access_token } = tokens;

    const first = searchParams.get("first") || "10";
    const query = searchParams.get("query") || "";

    // Construct GraphQL query
    const graphqlQuery = {
      query: `
        query GetOrders($first: Int!, $query: String) {
          orders(first: $first, query: $query) {
            edges {
              node {
                id
                name
                createdAt
                displayFulfillmentStatus
                displayFinancialStatus
                customer {
                  firstName
                  lastName
                  email
                }
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
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
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
