import { NextRequest, NextResponse } from "next/server";
import {
  getAllKeys,
  createKey,
  generateApiKey,
} from "./storage";

// GET /api/keys - List all API keys
export async function GET() {
  try {
    const keys = getAllKeys();
    return NextResponse.json(keys);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST /api/keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const newKey = createKey(name.trim(), generateApiKey());

    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

