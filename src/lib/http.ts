import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parseError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Please check your details", issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      { status: 400 },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/** Reject cross-site form posts to JSON mutation endpoints. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
