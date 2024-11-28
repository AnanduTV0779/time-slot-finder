import checkParticipantAvailableSlots from "@/app/util/checkParticipantAvailableSlots";
import { CheckSlotsInput, ErrorResponse, SlotResult } from "@/app/util/type";


export async function POST(req: Request): Promise<Response> {
  try {
    const input: CheckSlotsInput = await req.json();
    
    const result: SlotResult = await checkParticipantAvailableSlots(input);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      const errorResponse: ErrorResponse = {
        error: "Internal Server Error",
        details: error.message,
      };
      return new Response(JSON.stringify(errorResponse), { status: 500 });
    }

    const errorResponse: ErrorResponse = {
      error: "Internal Server Error",
      details: "An unexpected error occurred.",
    };

    return new Response(JSON.stringify(errorResponse), { status: 500 });
  }
}
