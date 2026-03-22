import { XMLParser } from 'fast-xml-parser';

const API_KEY = import.meta.env.VITE_NONGSARO_API_KEY || '20260313QLXWACN3CIHR4QUHIFW';
const BASE_URL = '/api/nongsaro';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['item'].includes(name),
});

// 코드 매핑
export const LIGHT_CODE: Record<string, string> = {
  '055001': '낮은 광도 (300~800 Lux)',
  '055002': '중간 광도 (800~1,500 Lux)',
  '055003': '높은 광도 (1,500~10,000 Lux)',
};

export const WATER_CODE: Record<string, string> = {
  '053001': '토양 표면이 말랐을 때 관수',
  '053002': '일주일에 1~2회 정도 관수',
  '053003': '흙이 마르면 충분히 관수',
  '053004': '화분 흙 대부분 말랐을 때 충분히 관수',
  '053005': '항상 촉촉하게 유지',
};

export const GROW_SPEED_CODE: Record<string, string> = {
  '058001': '느림',
  '058002': '보통',
  '058003': '빠름',
};

export const MANAGE_LEVEL_CODE: Record<string, string> = {
  '089001': '초보자 수준',
  '089002': '경험자 수준',
  '089003': '전문가 수준',
};

export const HUMIDITY_CODE: Record<string, string> = {
  '083001': '습도 40% 이하',
  '083002': '습도 40~70%',
  '083003': '습도 70% 이상',
};

export interface NongsaroPlant {
  cntntsNo: string; // 콘텐츠 번호
  cntntsSj: string; // 식물명
  rtnFileUrl?: string; // 이미지 URL
  rtnFileUrl2?: string; // 이미지 URL2
  // 상세 정보
  lightDemand?: string; // 광도
  waterCycle?: string; // 물주기
  growthAroma?: string; // 생장속도
  manageLevel?: string; // 관리난이도
  humidity?: string; // 습도
  winterLwetTp?: string; // 겨울 최저 온도
  summerMxtp?: string; // 여름 최고 온도
  grwhTpCode?: string; // 생육온도 코드
  winterLwetTpCode?: string; // 겨울 최저 온도 코드
  summerMxtpCode?: string; // 여름 최고 온도 코드
  orgplceInfo?: string; // 원산지 정보
  adviceInfo?: string; // 조언 정보
  // 계절별 물주기
  waterCycleSpringCode?: string;
  waterCycleSummerCode?: string;
  waterCycleAutumnCode?: string;
  waterCycleWinterCode?: string;
}

export interface NongsaroListResponse {
  items: NongsaroPlant[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
}

export interface NongsaroDetailResponse {
  plant: NongsaroPlant;
}

/**
 * 농사로 API 식물 목록 조회
 */
export async function fetchPlantList(
  searchText: string = '',
  pageNo: number = 1,
  numOfRows: number = 20
): Promise<NongsaroListResponse> {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    numOfRows: numOfRows.toString(),
    pageNo: pageNo.toString(),
  });

  if (searchText) {
    params.append('sType', 'cntntsSj');
    params.append('sText', searchText);
  }

  const url = `${BASE_URL}/gardenList?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const xmlText = await response.text();
    const json = parser.parse(xmlText);

    const body = json?.response?.body;
    if (!body) {
      return { items: [], totalCount: 0, pageNo, numOfRows };
    }

    const items = body?.items?.item || [];
    const itemList = Array.isArray(items) ? items : [items];

    const plants: NongsaroPlant[] = itemList.map((item: any) => ({
      cntntsNo: item.cntntsNo || '',
      cntntsSj: item.cntntsSj || '',
      rtnFileUrl: item.rtnFileUrl || '',
      rtnFileUrl2: item.rtnFileUrl2 || '',
    }));

    return {
      items: plants,
      totalCount: parseInt(body.totalCount || '0', 10),
      pageNo: parseInt(body.pageNo || '1', 10),
      numOfRows: parseInt(body.numOfRows || '20', 10),
    };
  } catch (error) {
    console.error('농사로 API 목록 조회 실패:', error);
    return { items: [], totalCount: 0, pageNo, numOfRows };
  }
}

/**
 * 농사로 API 식물 상세 조회
 */
export async function fetchPlantDetail(cntntsNo: string): Promise<NongsaroPlant | null> {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    cntntsNo,
  });

  const url = `${BASE_URL}/gardenDtl?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const xmlText = await response.text();
    const json = parser.parse(xmlText);

    const item = json?.response?.body?.item;
    if (!item) {
      return null;
    }

    return {
      cntntsNo: item.cntntsNo || '',
      cntntsSj: item.cntntsSj || '',
      rtnFileUrl: item.rtnFileUrl || '',
      rtnFileUrl2: item.rtnFileUrl2 || '',
      lightDemand: item.lightDemand || item.lghttdemandCode || '',
      waterCycle: item.waterCycle || '',
      growthAroma: item.growthAroma || item.grwtveCode || '',
      manageLevel: item.manageLevel || item.managedemandCode || '',
      humidity: item.humidity || item.hdCode || '',
      winterLwetTp: item.winterLwetTp || '',
      summerMxtp: item.summerMxtp || '',
      grwhTpCode: item.grwhTpCode || '',
      winterLwetTpCode: item.winterLwetTpCode || '',
      summerMxtpCode: item.summerMxtpCode || '',
      orgplceInfo: item.orgplceInfo || '',
      adviceInfo: item.adviceInfo || '',
      waterCycleSpringCode: item.waterCycleSpringCode || '',
      waterCycleSummerCode: item.waterCycleSummerCode || '',
      waterCycleAutumnCode: item.waterCycleAutumnCode || '',
      waterCycleWinterCode: item.waterCycleWinterCode || '',
    };
  } catch (error) {
    console.error('농사로 API 상세 조회 실패:', error);
    return null;
  }
}

/**
 * 코드값을 사람이 읽을 수 있는 텍스트로 변환
 */
export function decodeLightCode(code: string): string {
  return LIGHT_CODE[code] || code;
}

export function decodeWaterCode(code: string): string {
  return WATER_CODE[code] || code;
}

export function decodeGrowSpeedCode(code: string): string {
  return GROW_SPEED_CODE[code] || code;
}

export function decodeManageLevelCode(code: string): string {
  return MANAGE_LEVEL_CODE[code] || code;
}

export function decodeHumidityCode(code: string): string {
  return HUMIDITY_CODE[code] || code;
}

/**
 * 생육온도 코드를 온도 범위 문자열로 변환
 */
export function decodeTempCode(code: string): string {
  const tempMap: Record<string, string> = {
    '054001': '10~15°C',
    '054002': '16~20°C',
    '054003': '21~25°C',
    '054004': '26~30°C',
  };
  return tempMap[code] || code;
}

/**
 * 이미지 URL 생성 (농사로 CDN)
 */
export function getNongsaroImageUrl(rtnFileUrl: string): string {
  if (!rtnFileUrl) return '';
  if (rtnFileUrl.startsWith('http')) return rtnFileUrl;
  return `https://www.nongsaro.go.kr${rtnFileUrl}`;
}
