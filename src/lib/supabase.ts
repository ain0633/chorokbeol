import { createClient } from '@supabase/supabase-js';
import type { UserPlant, CareLog, DiaryEntry, ChatMessage } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uonkzjouepnlezizhspy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbmt6am91ZXBubGV6aXpoc3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwNjM1MDAsImV4cCI6MjAzNDYzOTUwMH0.DqEyU3ywDbheX8CJKcvX6Q_Pubo2cokjLF_3w0i-PvKo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// 인증 관련 함수
// ============================================

export interface AuthUser {
  id: string;
  email: string;
}

export async function signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    if (data.user) {
      return { 
        user: { id: data.user.id, email: data.user.email || email }, 
        error: null 
      };
    }
    
    return { user: null, error: '인증 이메일을 확인해주세요' };
  } catch (err) {
    return { user: null, error: '회원가입 중 오류가 발생했습니다' };
  }
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    if (data.user) {
      return { 
        user: { id: data.user.id, email: data.user.email || email }, 
        error: null 
      };
    }
    
    return { user: null, error: '로그인에 실패했습니다' };
  } catch (err) {
    return { user: null, error: '로그인 중 오류가 발생했습니다' };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  } catch (err) {
    return { error: '로그아웃 중 오류가 발생했습니다' };
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return { id: user.id, email: user.email || '' };
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function getSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    return null;
  }
}

// ============================================
// 식물 관련 함수
// ============================================

export async function fetchUserPlants(userId: string): Promise<UserPlant[]> {
  try {
    const { data, error } = await supabase
      .from('user_plants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('식물 목록 조회 실패:', err);
    return [];
  }
}

export async function savePlant(userId: string, plant: UserPlant): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('user_plants')
      .upsert({
        id: plant.id,
        user_id: userId,
        cntnts_no: plant.cntnts_no,
        plant_name: plant.plant_name,
        nickname: plant.nickname,
        img_url: plant.img_url,
        water_cycle: plant.water_cycle,
        light_demand: plant.light_demand,
        temp_range: plant.temp_range,
        last_watered_at: plant.last_watered_at,
        last_soil_check_at: plant.last_soil_check_at,
        soil_moisture_level: plant.soil_moisture_level,
        typical_dry_interval_days: plant.typical_dry_interval_days,
        calibration_factor: plant.calibration_factor,
        water_amount_ml: plant.water_amount_ml,
        placement_setting: plant.placement_setting,
        placement_direction: plant.placement_direction,
        pot_type: plant.pot_type,
        soil_type: plant.soil_type,
        has_ac_nearby: plant.has_ac_nearby,
        ventilation_level: plant.ventilation_level,
        created_at: plant.created_at,
        persona_info: plant.persona_info,
      }, {
        onConflict: 'id'
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: '식물 저장 중 오류가 발생했습니다' };
  }
}

export async function deletePlant(plantId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('user_plants')
      .delete()
      .eq('id', plantId);
    
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: '식물 삭제 중 오류가 발생했습니다' };
  }
}

export async function updatePlantPersona(
  plantId: string, 
  personaInfo: UserPlant['persona_info']
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('user_plants')
      .update({ persona_info: personaInfo })
      .eq('id', plantId);
    
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: '페르소나 업데이트 중 오류가 발생했습니다' };
  }
}

// ============================================
// 케어 로그 함수
// ============================================

export async function fetchCareLogs(userId: string, plantId?: string): Promise<CareLog[]> {
  try {
    let query = supabase
      .from('care_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (plantId) {
      query = query.eq('plant_id', plantId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('케어 로그 조회 실패:', err);
    return [];
  }
}

export async function saveCareLog(userId: string, log: CareLog): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('care_logs')
      .insert({
        id: log.id,
        user_id: userId,
        plant_id: log.plant_id,
        activity_type: log.activity_type,
        timestamp: log.timestamp,
        amount_ml: log.amount_ml,
        notes: log.notes,
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: '케어 로그 저장 중 오류가 발생했습니다' };
  }
}

// ============================================
// 일기 함수
// ============================================

export async function fetchDiaryEntries(userId: string, plantId?: string): Promise<DiaryEntry[]> {
  try {
    let query = supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (plantId) {
      query = query.eq('plant_id', plantId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('일기 조회 실패:', err);
    return [];
  }
}

export async function saveDiaryEntry(userId: string, entry: DiaryEntry): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('diary_entries')
      .insert({
        id: entry.id,
        user_id: userId,
        plant_id: entry.plant_id,
        content: entry.content,
        image_url: entry.image_url,
        weather_temp: entry.weather_temp,
        weather_condition: entry.weather_condition,
        created_at: entry.created_at,
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: '일기 저장 중 오류가 발생했습니다' };
  }
}

export async function deleteDiaryEntry(entryId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', entryId);
    
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: '일기 삭제 중 오류가 발생했습니다' };
  }
}

// ============================================
// 채팅 함수
// ============================================

export async function fetchChatThreads(userId: string): Promise<{ id: string; plant_id: string; plant_name: string }[]> {
  try {
    const { data, error } = await supabase
      .from('chat_threads')
      .select('id, plant_id, plant_name')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('채팅 스레드 조회 실패:', err);
    return [];
  }
}

export async function fetchChatMessages(threadId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('채팅 메시지 조회 실패:', err);
    return [];
  }
}

export async function saveChatMessage(
  userId: string, 
  plantId: string, 
  plantName: string,
  message: ChatMessage
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 먼저 스레드가 있는지 확인
    let threadId: string;
    
    const { data: threadData } = await supabase
      .from('chat_threads')
      .select('id')
      .eq('user_id', userId)
      .eq('plant_id', plantId)
      .single();
    
    if (threadData) {
      threadId = threadData.id;
    } else {
      // 새 스레드 생성
      const { data: newThread, error: threadError } = await supabase
        .from('chat_threads')
        .insert({
          user_id: userId,
          plant_id: plantId,
          plant_name: plantName,
        })
        .select('id')
        .single();
      
      if (threadError || !newThread) {
        return { success: false, error: threadError?.message || '스레드 생성 실패' };
      }
      threadId = newThread.id;
    }
    
    // 메시지 저장
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        id: message.id,
        thread_id: threadId,
        role: message.role,
        content: message.content,
        created_at: message.created_at,
      });
    
    // 스레드更新时间
    await supabase
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);
    
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: '채팅 메시지 저장 중 오류가 발생했습니다' };
  }
}

// ============================================
// 마이그레이션 함수
// ============================================

export async function migrateLocalDataToSupabase(
  userId: string,
  localData: {
    myPlants: UserPlant[];
    careLogs: CareLog[];
    diaryEntries: DiaryEntry[];
    chatMessages: ChatMessage[];
  }
): Promise<{ success: boolean; error: string | null; migratedCount: number }> {
  let migratedCount = 0;
  
  try {
    // 1. 식물 마이그레이션
    for (const plant of localData.myPlants) {
      const result = await savePlant(userId, plant);
      if (result.success) migratedCount++;
    }
    
    // 2. 케어 로그 마이그레이션
    for (const log of localData.careLogs) {
      const result = await saveCareLog(userId, log);
      if (result.success) migratedCount++;
    }
    
    // 3. 일기 마이그레이션
    for (const entry of localData.diaryEntries) {
      const result = await saveDiaryEntry(userId, entry);
      if (result.success) migratedCount++;
    }
    
    // 4. 채팅 마이그레이션
    const plantChatMap = new Map<string, ChatMessage[]>();
    for (const msg of localData.chatMessages) {
      const existing = plantChatMap.get(msg.plant_id) || [];
      existing.push(msg);
      plantChatMap.set(msg.plant_id, existing);
    }
    
    for (const [plantId, messages] of plantChatMap) {
      const plant = localData.myPlants.find(p => p.id === plantId);
      const plantName = plant?.plant_name || '알 수 없는 식물';
      
      for (const msg of messages) {
        const result = await saveChatMessage(userId, plantId, plantName, msg);
        if (result.success) migratedCount++;
      }
    }
    
    return { success: true, error: null, migratedCount };
  } catch (err) {
    return { success: false, error: '마이그레이션 중 오류가 발생했습니다', migratedCount };
  }
}
