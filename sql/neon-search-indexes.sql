CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS products_title_trgm_idx
  ON products
  USING gin (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS products_id_trgm_idx
  ON products
  USING gin (id gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS products_category_label_trgm_idx
  ON products
  USING gin (category_label gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS products_category_trgm_idx
  ON products
  USING gin (category gin_trgm_ops);
