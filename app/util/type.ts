export type Participant = {
  [key in 1 | 2 | 3]: { name: string; threshold: number };
};

export type TimeSlot = {
  start: string | null;
  end: string | null;
};

export type CheckSlotsInput = {
  participant_ids: number[];
  date_range: TimeSlot;
};

export type Availability = {
  [day: string]: TimeSlot[];
};

export type Schedule = {
  [date: string]: TimeSlot[];
};

export type CheckSlotsOutput = {
  [date: string]: string[];
};

export interface SlotResult {
  [key: string]: string[]; 
}

export interface ErrorResponse {
  error: string;
  details: string;
}

