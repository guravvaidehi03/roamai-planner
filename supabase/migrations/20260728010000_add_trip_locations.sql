-- Trip locations table to track where customers have traveled
CREATE TABLE public.trip_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_locations TO authenticated;
GRANT ALL ON public.trip_locations TO service_role;
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trip locations" ON public.trip_locations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX trip_locations_user_id_idx ON public.trip_locations(user_id);
CREATE INDEX trip_locations_trip_id_idx ON public.trip_locations(trip_id);

CREATE TRIGGER trip_locations_set_updated_at BEFORE UPDATE ON public.trip_locations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add latitude and longitude columns to trips table for quick access
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;