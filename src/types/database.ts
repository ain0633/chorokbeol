export interface PlantTrait {
  lightLevel: '낮은' | '중간' | '높은';
  waterNeed: '적은' | '보통' | '많은';
  humidityNeed: '건조' | '보통' | '습함';
  growSpeed: '느림' | '보통' | '빠름';
  manageLevel: '초보' | '중급' | '전문가';
  tempRange: { min: number; max: number };
  origin?: string;
}

export interface PlantEmotion {
  water: number;
  light: number;
  air: number;
  temp: number;
  overall: number;
}

export interface PlantPersonaInfo {
  name: string;
  personality: string;
  speechStyle: string;
  emoji: string;
  
  // Nongsaro API 기반 특성
  lightPreference: string;
  waterPreference: string;
  humidityPreference: string;
  growSpeed: string;
  manageLevel: string;
  tempRange: string;
  origin?: string;
  
  // 파생된 특성 (AI 프롬프트용)
  trait?: PlantTrait;
  
  // 관계 데이터
  intimacyLevel: number;      // 친밀도 (1-10)
  conversationCount: number;  // 대화 횟수
  daysTogether: number;       // 함께한 날
  lastInteraction?: string;   // 마지막 상호작용 시간
  
  // 동적 데이터
  likes: string[];
  dislikes: string[];
  greetings: string[];
  careAdvice: string[];
  
  // 기억 (최근 대화 요약)
  recentMemories: string[];
}

export type PotType = 'general' | 'terrarium' | 'hydroponic';
export type SoilType = 'standard' | 'moss' | 'cactus' | 'hydro';
export type VentilationLevel = 'poor' | 'normal' | 'good';
export type PlacementType = 'window' | 'indoor' | 'balcony' | 'office';
export type DirectionType = 'south' | 'east' | 'west' | 'north';

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
  pot_type?: PotType;
  soil_type?: SoilType;
  has_ac_nearby?: boolean;
  ventilation_level?: VentilationLevel;
  created_at: string;
  persona_info?: PlantPersonaInfo;
}

export interface OnboardingData {
  plantName: string;
  plantImgUrl: string;
  cntntsNo: string;
  waterCycle: string;
  lightDemand: string;
  tempRange: string;
  interval: number;
  nickname: string;
  lastWateredAt: Date;
  placement: PlacementType;
  direction: DirectionType;
  potType: PotType;
  soilType: SoilType;
  hasAcNearby: boolean;
  ventilation: VentilationLevel;
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

export interface DiaryEntry {
  id: string;
  plant_id: string;
  content: string;
  image_url?: string;
  weather_temp?: number;
  weather_condition?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  plant_id: string;
  role: 'user' | 'plant';
  content: string;
  created_at: string;
}

export type ReminderType = 'watering' | 'misting' | 'fertilizing' | 'soil_check' | 'custom';

export interface Reminder {
  id: string;
  user_id: string;
  plant_id: string;
  reminder_type: ReminderType;
  title: string;
  message?: string;
  scheduled_for: string;
  is_completed: boolean;
  is_repeatable: boolean;
  repeat_interval_days?: number;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  push_enabled: boolean;
  watering_reminder: boolean;
  weather_alert: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  created_at: string;
  updated_at: string;
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
    placement_setting: 'window',
    placement_direction: 'south',
    pot_type: 'general',
    soil_type: 'standard',
    has_ac_nearby: false,
    ventilation_level: 'normal',
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
    pot_type: 'general',
    soil_type: 'cactus',
    has_ac_nearby: false,
    ventilation_level: 'normal',
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
    placement_setting: 'window',
    placement_direction: 'south',
    pot_type: 'general',
    soil_type: 'moss',
    has_ac_nearby: false,
    ventilation_level: 'good',
  },
];
