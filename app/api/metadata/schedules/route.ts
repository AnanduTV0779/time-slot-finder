import { getAsync } from "../../../util/redis";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getAsync("TimeSheet:schedules");
  
  if (data) {
    console.log("Data successfully fetched from Redis");
    return new Response(JSON.stringify(data), { status: 200 });
  } else {
    console.log("Error fetching data from Redis");
    return NextResponse.json({ message: "Error fetching data from Redis" }, { status: 500 });
  }
}
