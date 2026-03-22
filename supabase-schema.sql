-- ============================================
-- 초록별 (Chorokbyeol) Supabase 스키마
-- ============================================

-- 1. 식물 목록 테이블
CREATE TABLE IF NOT EXISTS user_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cntnts_no TEXT,
  plant_name TEXT NOT NULL,
  nickname TEXT,
  img_url TEXT,
  water_cycle TEXT,
  light_demand TEXT,
  temp_range TEXT,
  last_watered_at TIMESTAMPTZ DEFAULT NOW(),
  last_soil_check_at TIMESTAMPTZ,
  soil_moisture_level TEXT CHECK (soil_moisture_level IN ('dry', 'moist', 'wet')),
  typical_dry_interval_days INTEGER DEFAULT 7,
  calibration_factor DECIMAL DEFAULT 1.0,
  water_amount_ml INTEGER DEFAULT 200,
  placement_setting TEXT DEFAULT 'indoor',
  placement_direction TEXT DEFAULT 'south',
  pot_type TEXT DEFAULT 'general' CHECK (pot_type IN ('general', 'terrarium', 'hydroponic')),
  soil_type TEXT DEFAULT 'standard' CHECK (soil_type IN ('standard', 'moss', 'cactus', 'hydro')),
  has_ac_nearby BOOLEAN DEFAULT false,
  ventilation_level TEXT DEFAULT 'normal' CHECK (ventilation_level IN ('poor', 'normal', 'good')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  persona_info JSONB,
  CONSTRAINT unique_user_plant UNIQUE (user_id, plant_name, nickname)
);

-- 2. 케어 로그 테이블
CREATE TABLE IF NOT EXISTS care_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('watering', 'misting', 'fertilizing', 'leaf_cleaning', 'repotting')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  amount_ml INTEGER,
  notes TEXT
);

-- 3. 일기 테이블
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  weather_temp DECIMAL,
  weather_condition TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 채팅 스레드 테이블
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id TEXT NOT NULL,
  plant_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_plant_thread UNIQUE (user_id, plant_id)
);

-- 5. 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'plant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 알림/리마인더 테이블
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('watering', 'misting', 'fertilizing', 'soil_check', 'custom')),
  title TEXT NOT NULL,
  message TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  is_repeatable BOOLEAN DEFAULT false,
  repeat_interval_days INTEGER,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 알림 설정 테이블
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  watering_reminder BOOLEAN DEFAULT true,
  weather_alert BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 인덱스 생성
-- ============================================

CREATE INDEX IF NOT EXISTS idx_plants_user ON user_plants(user_id);
CREATE INDEX IF NOT EXISTS idx_carelogs_plant ON care_logs(plant_id);
CREATE INDEX IF NOT EXISTS idx_carelogs_user ON care_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_plant ON diary_entries(plant_id);
CREATE INDEX IF NOT EXISTS idx_diary_user ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_user ON chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_plant ON reminders(plant_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notif_settings_user ON notification_settings(user_id);

-- ============================================
-- Row Level Security (RLS) 설정
-- ============================================

-- user_plants RLS
ALTER TABLE user_plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plants" ON user_plants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants" ON user_plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants" ON user_plants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants" ON user_plants
  FOR DELETE USING (auth.uid() = user_id);

-- care_logs RLS
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own care logs" ON care_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care logs" ON care_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care logs" ON care_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own care logs" ON care_logs
  FOR DELETE USING (auth.uid() = user_id);

-- diary_entries RLS
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diary entries" ON diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries" ON diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries" ON diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries" ON diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- chat_threads RLS
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat threads" ON chat_threads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat threads" ON chat_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat threads" ON chat_threads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat threads" ON chat_threads
  FOR DELETE USING (auth.uid() = user_id);

-- chat_messages RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own threads" ON chat_messages
  FOR SELECT USING (
    thread_id IN (SELECT id FROM chat_threads WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in own threads" ON chat_messages
  FOR INSERT WITH CHECK (
    thread_id IN (SELECT id FROM chat_threads WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete messages in own threads" ON chat_messages
  FOR DELETE USING (
    thread_id IN (SELECT id FROM chat_threads WHERE user_id = auth.uid())
  );

-- reminders RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- notification_settings RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 트리거 함수
-- ============================================

-- chat_threads updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_threads_updated_at
  BEFORE UPDATE ON chat_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 데이터 마이그레이션 (기존 데이터가 있는 경우)
-- ============================================

-- Note: 이 스크립트를 실행하기 전에 기존 데이터 백업을 권장합니다.
-- 백업 없이 실행하면 데이터가 손실될 수 있습니다.

-- 마이그레이션 예시 (실행 전必ず 백업하세요):
/*
-- 기존 localStorage 데이터를 migration하는 방법:
-- 1. 브라우저 개발자 도구에서 localStorage['chorokbyeol-store'] 확인
-- 2. JSON 데이터를 파싱하여 각 테이블에 INSERT
*/
