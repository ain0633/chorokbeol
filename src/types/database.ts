export interface UserPlant {
  id: string;
  cntnts_no: string;
  plant_name: string;
  nickname: string;
  img_url: string;
  water_cycle: string;
  light_demand: string;
  temp_range: string;
  last_watered_at: string;
  last_soil_check_at?: string;
  soil_moisture_level?: 'dry' | 'moist' | 'wet';
  typical_dry_interval_days: number;
  calibration_factor: number;
  water_amount_ml: number;
  placement_setting: string;
  placement_direction: string;
  created_at: string;
}

export type CareActivityType = 'watering' | 'misting' | 'fertilizing' | 'leaf_cleaning' | 'repotting';

export interface CareLog {
  id: string;
  plant_id: string;
  activity_type: CareActivityType;
  timestamp: string;
  amount_ml?: number;
  notes?: string;
}

export interface Location {
  lat: number;
  lon: number;
}

export interface Weather {
  temp: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  description: string;
  icon: string;
  cityName: string;
  windSpeed: number;
  uvi: number;
  sunrise: number;
  sunset: number;
  clouds: number;
  visibility: number;
}

export interface Vitals {
  water: { value: number; label: string };
  light: { value: number; label: string };
  air: { value: number; label: string };
  temp: { value: number; label: string };
}

// Sample plants for demo
export const SAMPLE_PLANTS: Omit<UserPlant, 'id' | 'created_at'>[] = [
  {
    cntnts_no: '1',
    plant_name: '몬스테라 델리시오사',
    nickname: '몬몬이',
    img_url: '',
    water_cycle: '주 1-2회',
    light_demand: '밝은 간접광',
    temp_range: '18-27°C',
    last_watered_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    typical_dry_interval_days: 7,
    calibration_factor: 1.0,
    water_amount_ml: 200,
    placement_setting: 'indoor',
    placement_direction: 'south',
  },
  {
    cntnts_no: '2',
    plant_name: '스투키',
    nickname: '뚜키',
    img_url: '',
    water_cycle: '월 1-2회',
    light_demand: '밝은 간접광~반양지',
    temp_range: '15-30°C',
    last_watered_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    typical_dry_interval_days: 14,
    calibration_factor: 1.0,
    water_amount_ml: 150,
    placement_setting: 'indoor',
    placement_direction: 'east',
  },
  {
    cntnts_no: '3',
    plant_name: '아레카야자',
    nickname: '야야',
    img_url: '',
    water_cycle: '주 2-3회',
    light_demand: '밝은 간접광',
    temp_range: '18-24°C',
    last_watered_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    typical_dry_interval_days: 4,
    calibration_factor: 1.0,
    water_amount_ml: 250,
    placement_setting: 'indoor',
    placement_direction: 'south',
  },
];
