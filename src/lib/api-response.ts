import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    { status },
  );
}

export function errorResponse(error: string, status = 500, code?: string) {
  return NextResponse.json<ApiResponse>(
    { success: false, error, code },
    { status },
  );
}

export function createdResponse<T>(data: T) {
  return successResponse(data, 201);
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse(`${resource} not found`, 404, "NOT_FOUND");
}

export function badRequestResponse(error: string) {
  return errorResponse(error, 400, "BAD_REQUEST");
}

export function unauthorizedResponse(error = "Unauthorized") {
  return errorResponse(error, 401, "UNAUTHORIZED");
}
