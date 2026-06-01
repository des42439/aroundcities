export type Status =
  | "active"
  | "inactive"
  | "obsoleted";

export interface Event {
  event_id: string;
  status: Status;

  title: string;
  description: string | null;

  location: string | null;

  start_date: string | null;
  end_date: string | null;

  organiser: string | null;

  source_link: string | null;
  source_remarks: string | null;

  created_at: string;
  created_by: string | null;

  updated_at: string;
  updated_by: string | null;
}

export interface EventRegistration {
  event_registration_id: string;

  event_id: string;

  status: Status;

  start_date: string | null;
  end_date: string | null;

  registration_url: string | null;

  created_at: string;
  created_by: string | null;

  updated_at: string;
  updated_by: string | null;
}

export interface EventSchedule {
  event_schedule_id: string;

  event_id: string;

  status: Status;

  event_date: string;

  start_time: string | null;
  end_time: string | null;

  created_at: string;
  created_by: string | null;

  updated_at: string;
  updated_by: string | null;
}

export interface EventProgram {
  event_program_id: string;

  event_schedule_id: string;

  status: Status;

  title: string;

  description: string | null;

  start_time: string | null;
  end_time: string | null;

  organiser: string | null;

  photo_url: string | null;

  source_link: string | null;
  source_type: string | null;

  created_at: string;
  created_by: string | null;

  updated_at: string;
  updated_by: string | null;
}

export interface Photo {
  photo_id: string;

  event_id: string | null;

  status: Status;

  photo_type: "photo" | "screenshot";

  photo_url: string;

  title: string | null;
  description: string | null;

  latitude: number | null;
  longitude: number | null;
  location: string | null;

  captured_date: string | null;
  captured_by: string | null;

  created_at: string;
  created_by: string | null;

  updated_at: string;
  updated_by: string | null;
}

export interface Holiday {
  holiday_id: string;

  status: Status;

  holiday_date: string;

  name: string;

  description: string | null;

  greeting_message_1: string | null;
  greeting_message_2: string | null;
  greeting_message_3: string | null;

  created_at: string;
  created_by: string | null;

  updated_at: string;
  updated_by: string | null;
}

export interface PositiveMessage {
  positive_message_id: string;

  status: Status;

  description: string;

  created_at: string;
  created_by: string | null;

  updated_at: string;
  updated_by: string | null;
}