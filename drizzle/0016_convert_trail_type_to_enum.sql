-- Normalize existing trail_type text values to enum keys
UPDATE hikes SET trail_type = 'loop' WHERE LOWER(trail_type) = 'loop';
UPDATE hikes SET trail_type = 'out_and_back' WHERE LOWER(trail_type) IN ('out & back', 'out and back', 'out-and-back');
UPDATE hikes SET trail_type = 'point_to_point' WHERE LOWER(trail_type) IN ('point to point', 'point-to-point');
-- Clear any values that don't match the enum
UPDATE hikes SET trail_type = NULL WHERE trail_type NOT IN ('loop', 'out_and_back', 'point_to_point');

-- Create the enum type
CREATE TYPE trail_type AS ENUM ('loop', 'out_and_back', 'point_to_point');

-- Convert the column from text to the enum
ALTER TABLE hikes ALTER COLUMN trail_type TYPE trail_type USING trail_type::trail_type;
