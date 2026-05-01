import { NextResponse } from "next/server";
import { getPendientesData } from "@/lib/movements-data";

export async function GET() {
  const pendientes = await getPendientesData();
  return NextResponse.json(pendientes);
}
