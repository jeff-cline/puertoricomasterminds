-- 0005_storage.sql
-- Creates the public prm-images storage bucket for admin image uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('prm-images', 'prm-images', true)
ON CONFLICT DO NOTHING;
