export interface Car {
  id: number;
  brand: string;
  brand_id: number;
  model: string;
  year: number;
  engine_size: string | null;
  engine_label: string;
  mileage: number | null;
  mileage_label: string;
  fuel_type: FuelType | null;
  transmission: Transmission | null;
  price_krw: number | null;
  price_eur: number | null;
  image_url: string | null;
  has_accident: boolean;
  has_simple_repair: boolean;
  is_featured: boolean;
  source_url: string | null;
  created_at: string;
}

export interface CarDetail extends Car {
  thumbnail_urls: string[];
  external_inspection: ExternalInspection | null;
  internal_inspection: InternalInspection | null;
  diagnostic_data: DiagnosticItem[] | null;
  inners: InnerInspection | null;
}

export interface ExternalInspection {
  conditions?: string[];
}

export interface InternalInspection {
  options?: string[];
}

export interface DiagnosticItem {
  category: string;
  name: string;
  status: string;
  value?: string;
}

export interface InnerInspection {
  [key: string]: unknown;
}

export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'other';
export type Transmission = 'automatic' | 'manual' | 'semi-automatic' | 'cvt' | 'other';
export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface FilterOptions {
  brands: string[];
  fuel_types: FuelType[];
  transmissions: Transmission[];
  year_range: { min: number; max: number };
  price_range: { min: number; max: number };
}

export interface CarsResponse {
  data: Car[];
  pagination: PaginationMeta;
  filters: FilterOptions;
}

export interface CarDetailResponse {
  data: CarDetail;
}

export interface CarFilters {
  brand?: string;
  fuel?: FuelType;
  transmission?: Transmission;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  mileage_max?: number;
  no_accident?: boolean;
  search?: string;
  sort?: SortOption;
  page?: number;
  per_page?: number;
}

export interface Brand {
  id: number;
  name: string;
  logo_url: string | null;
  cars_count: number;
}

export interface BrandsResponse {
  data: Brand[];
}
