import { participantAvailability, participants, schedules } from "@/app/util/data";
import { setAsync } from "../../util/redis";
import { NextResponse } from "next/server";

export async function POST() {

  // Attempt to set data in Redis
  const schedulesSuccess = await setAsync("TimeSheet:schedules", schedules);
  const availabilitySuccess = await setAsync("TimeSheet:participantAvailability", participantAvailability);
  const participantsSuccess = await setAsync("TimeSheet:participants", participants);

  // Check if all set operations were successful
  if (schedulesSuccess && availabilitySuccess && participantsSuccess) {
    console.log("Data successfully posted to Redis");
    return NextResponse.json({ message: "Data successfully posted to Redis" });
  } else {
    console.log("Error posting data to Redis");
    return NextResponse.json({ message: "Error posting data to Redis" }, { status: 500 });
  }
}
