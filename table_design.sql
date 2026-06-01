-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.events (
  event_id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'inactive'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'obsoleted'::text])),
  title text NOT NULL,
  description text,
  location text,
  start_date date,
  end_date date,
  organiser text,
  source_link text,
  source_remarks text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT events_pkey PRIMARY KEY (event_id)
);
CREATE TABLE public.event_registrations (
  event_registration_id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'inactive'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'obsoleted'::text])),
  start_date date,
  end_date date,
  registration_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT event_registrations_pkey PRIMARY KEY (event_registration_id),
  CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id)
);
CREATE TABLE public.event_schedules (
  event_schedule_id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'inactive'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'obsoleted'::text])),
  event_date date NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT event_schedules_pkey PRIMARY KEY (event_schedule_id),
  CONSTRAINT event_schedules_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id)
);
CREATE TABLE public.event_programs (
  event_program_id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_schedule_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'inactive'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'obsoleted'::text])),
  title text NOT NULL,
  description text,
  start_time time without time zone,
  end_time time without time zone,
  organiser text,
  photo_url text,
  source_link text,
  source_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT event_programs_pkey PRIMARY KEY (event_program_id),
  CONSTRAINT event_programs_event_schedule_id_fkey FOREIGN KEY (event_schedule_id) REFERENCES public.event_schedules(event_schedule_id)
);
CREATE TABLE public.photos (
  photo_id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  status text NOT NULL DEFAULT 'inactive'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'obsoleted'::text])),
  photo_type text NOT NULL DEFAULT 'photo'::text CHECK (photo_type = ANY (ARRAY['photo'::text, 'screenshot'::text])),
  photo_url text NOT NULL,
  title text,
  description text,
  location text,
  captured_date timestamp with time zone,
  captured_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  latitude double precision,
  longitude double precision,
  CONSTRAINT photos_pkey PRIMARY KEY (photo_id),
  CONSTRAINT photos_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id)
);
CREATE TABLE public.holidays (
  holiday_id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'obsoleted'::text])),
  holiday_date date NOT NULL,
  name text NOT NULL,
  description text,
  greeting_message_1 text,
  greeting_message_2 text,
  greeting_message_3 text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT holidays_pkey PRIMARY KEY (holiday_id)
);
CREATE TABLE public.positive_messages (
  positive_message_id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'obsoleted'::text])),
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT positive_messages_pkey PRIMARY KEY (positive_message_id)
);
CREATE TABLE public.translations (
  translation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  reference_type text NOT NULL,
  reference_id uuid NOT NULL,
  language text NOT NULL CHECK (language = ANY (ARRAY['en'::text, 'bm'::text, 'zh'::text])),
  field_name text NOT NULL,
  translated_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT translations_pkey PRIMARY KEY (translation_id)
);
CREATE TABLE public.content_stats (
  content_stat_id uuid NOT NULL DEFAULT gen_random_uuid(),
  reference_type text NOT NULL,
  reference_id uuid NOT NULL,
  stat_date date NOT NULL,
  stat_hour integer NOT NULL CHECK (stat_hour >= 0 AND stat_hour <= 23),
  view_count integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT content_stats_pkey PRIMARY KEY (content_stat_id)
);