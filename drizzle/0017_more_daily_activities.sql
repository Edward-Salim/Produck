INSERT INTO "daily_activity" (
  "slug",
  "category",
  "category_description",
  "name",
  "detail",
  "icon",
  "level",
  "sort_order"
) VALUES
  ('mix-two-songs-once', 'Creative', 'Make something with your hands or ideas', 'Mix two songs once', 'Blend two tracks one time', 'audio-lines', 1, 260),
  ('tap-out-one-drum-pattern', 'Creative', 'Make something with your hands or ideas', 'Tap out a drum pattern', 'Make one short beat with your hands', 'drum', 1, 270),
  ('shadowbox-3-minutes', 'Movement', 'Get your body moving', 'Shadowbox 3 minutes', 'Box the air for one short round', 'hand-fist', 1, 140),
  ('practice-one-boxing-combo', 'Movement', 'Get your body moving', 'Practice one boxing combo', 'Repeat one simple combo slowly', 'biceps-flexed', 1, 150),
  ('practice-one-parking-drill', 'Learning', 'Feed your brain without overloading the day', 'Practice one parking drill', 'Practice one safe parking maneuver', 'car-front', 1, 340),
  ('review-car-controls', 'Learning', 'Feed your brain without overloading the day', 'Review car controls', 'Review pedals, mirrors, and signals', 'car', 1, 345),
  ('review-motorcycle-controls', 'Learning', 'Feed your brain without overloading the day', 'Review motorcycle controls', 'Review throttle, brakes, and balance', 'gauge', 1, 350),
  ('meditate-5-minutes', 'Relax & Play', 'Recover, enjoy, and make the day lighter', 'Meditate 5 minutes', 'Sit and follow your breath', 'flower-2', 2, 545),
  ('do-one-body-scan', 'Relax & Play', 'Recover, enjoy, and make the day lighter', 'Do one body scan', 'Notice each part of your body once', 'hand', 2, 550)
ON CONFLICT ("slug") DO UPDATE SET
  "category" = EXCLUDED."category",
  "category_description" = EXCLUDED."category_description",
  "name" = EXCLUDED."name",
  "detail" = EXCLUDED."detail",
  "icon" = EXCLUDED."icon",
  "level" = EXCLUDED."level",
  "sort_order" = EXCLUDED."sort_order",
  "enabled" = true,
  "updated_at" = now();
