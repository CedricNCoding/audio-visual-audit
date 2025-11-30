-- Fix search_path security warning - drop trigger first
DROP TRIGGER IF EXISTS set_cable_recommendation ON public.cables;
DROP FUNCTION IF EXISTS calculate_cable_recommendation() CASCADE;

CREATE OR REPLACE FUNCTION calculate_cable_recommendation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.signal_type = 'HDMI' THEN
    IF NEW.distance_m <= 5 THEN
      NEW.cable_recommendation := 'Câble HDMI direct';
    ELSE
      NEW.cable_recommendation := 'Extender HDMI sur réseau';
    END IF;
  ELSIF NEW.signal_type = 'USB' THEN
    IF NEW.distance_m <= 3 THEN
      NEW.cable_recommendation := 'Câble USB direct';
    ELSE
      NEW.cable_recommendation := 'Extender USB sur réseau';
    END IF;
  ELSIF NEW.signal_type = 'DisplayPort' THEN
    IF NEW.distance_m <= 5 THEN
      NEW.cable_recommendation := 'Câble DisplayPort direct';
    ELSE
      NEW.cable_recommendation := 'Extender DisplayPort sur réseau';
    END IF;
  ELSE
    NEW.cable_recommendation := 'Câble ' || NEW.signal_type;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_cable_recommendation
  BEFORE INSERT OR UPDATE ON public.cables
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cable_recommendation();