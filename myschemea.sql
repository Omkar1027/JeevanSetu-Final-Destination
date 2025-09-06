-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  doctor_id uuid,
  appointment_date timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])),
  symptoms text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id),
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id)
);
CREATE TABLE public.chatbot_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  message text NOT NULL,
  response text,
  message_type text NOT NULL DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'voice'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chatbot_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chatbot_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.doctors (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  gen_username character varying NOT NULL,
  gen_password character varying NOT NULL,
  specialty text,
  hospital text,
  rating numeric,
  CONSTRAINT doctors_pkey PRIMARY KEY (id),
  CONSTRAINT doctors_id_fkey FOREIGN KEY (id) REFERENCES public.users(id)
);
CREATE TABLE public.patients (
  id uuid NOT NULL,
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  blood_grp character varying,
  dob date,
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_id_fkey FOREIGN KEY (id) REFERENCES public.users(id)
);
CREATE TABLE public.prescriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  doctor_id uuid,
  appointment_id uuid,
  medicines jsonb NOT NULL,
  instructions text,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
  CONSTRAINT prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id),
  CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id)
);
CREATE TABLE public.sos_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  latitude double precision,
  longitude double precision,
  alert_time timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'notified'::text, 'resolved'::text])),
  CONSTRAINT sos_alerts_pkey PRIMARY KEY (id),
  CONSTRAINT sos_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'not set'::text CHECK (role = ANY (ARRAY['doctor'::text, 'patient'::text])),
  name text NOT NULL,
  avatar text,
  phone text,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);