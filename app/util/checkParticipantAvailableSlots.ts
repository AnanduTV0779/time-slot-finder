import {
  format,
  addMinutes,
  parse,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";
import {
  Availability,
  CheckSlotsInput,
  CheckSlotsOutput,
  TimeSlot,
} from "./type";
import { participantAvailability as mockParticipantAvailability , schedules as mockSchedules } from "./data";
import { getAsync } from "./redis";

// Utility function to generate 30-minute time slots
const generateSlots = (startTime: string, endTime: string): string[] => {

  const slots: string[] = [];
  let start = parse(startTime, "HH:mm", new Date());
  const end = parse(endTime, "HH:mm", new Date());

  while (start < end) {
    const nextSlot = addMinutes(start, 30);
    if (nextSlot <= end) {
      slots.push(`${format(start, "HH:mm")}-${format(nextSlot, "HH:mm")}`);
    }
    start = nextSlot;
  }

  return slots;
};

// Utility function to filter overlapping time slots
const filterOverlappingSlots = (
  slots: string[],
  schedule: TimeSlot[]
): string[] => {
  return slots.filter((slot) => {
    const [slotStart, slotEnd] = slot
      .split("-")
      .map((time) => parse(time, "HH:mm", new Date()));

    return !schedule.some(({ start, end }) => {
      const scheduleStart = parse(start as string, "HH:mm", new Date());
      const scheduleEnd = parse(end as string, "HH:mm", new Date());

      return (
        isWithinInterval(slotStart, {
          start: scheduleStart,
          end: scheduleEnd,
        }) ||
        isWithinInterval(slotEnd, { start: scheduleStart, end: scheduleEnd })
      );
    });
  });
};

const checkParticipantAvailableSlots = async (
  input: CheckSlotsInput
): Promise<CheckSlotsOutput> => {

  let participantAvailability = mockParticipantAvailability;
  let schedules = mockSchedules;
  
 
  const participantAvailabilityResponse = await getAsync("TimeSheet:participantAvailability") as {data: unknown; } | null;
  const schedulesResponse = await getAsync("TimeSheet:schedules") as {data: unknown; } | null;
  
  if (participantAvailabilityResponse) {
    //participantAvailability = participantAvailabilityResponse.data;  // need to change the format for participantAvailability string to number when get it from redis 
  }
  
  if (schedulesResponse) {
    //schedules = schedulesResponse.data;  // need to change the format for schedules string to number when get it from redis 
  }

  const { participant_ids, date_range } = input;
  const { start, end } = date_range;

  // Generate the range of dates
  const dates = eachDayOfInterval({
    start: parse(start as string, "dd/MM/yyyy", new Date()),
    end: parse(end as string, "dd/MM/yyyy", new Date()),
  }).map((date) => format(date, "dd/MM/yyyy"));

  // Collect available slots for each participant
  const allParticipantSlots = participant_ids.map(
    (id): Record<string, string[]> => {
      const availability = participantAvailability[id];
      const schedule = schedules[id] || {};

      const slotsByDate: Record<string, string[]> = {};

      dates.forEach((date) => {
        const day = format(
          parse(date, "dd/MM/yyyy", new Date()),
          "EEEE"
        ) as keyof Availability;
        const dailyAvailability = availability?.[day] || [];

        // Generate all 30-minute slots for the day's availability
        let slots = dailyAvailability.flatMap(({ start, end }) =>
          generateSlots(start as string, end as string)
        );

        // Filter out slots that overlap with the participant's schedule
        const dailySchedule = schedule[date] || [];
        slots = filterOverlappingSlots(slots, dailySchedule);

        if (slots.length > 0) {
          slotsByDate[date] = slots;
        }
      });

      return slotsByDate;
    }
  );

  // Find common available slots across all participants
  const commonSlots = dates.reduce((acc: CheckSlotsOutput, date) => {
    const dateSlots = allParticipantSlots.map(
      (participantSlots) => participantSlots[date] || []
    );
    const commonDateSlots = dateSlots.reduce(
      (common, slots) => common.filter((slot) => slots.includes(slot)),
      dateSlots[0] || []
    );

    if (commonDateSlots.length > 0) {
      acc[date] = commonDateSlots;
    }

    return acc;
  }, {});

  return commonSlots;
};

export default checkParticipantAvailableSlots;
