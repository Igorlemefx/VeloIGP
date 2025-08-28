import axios from 'axios';

const API_BASE_URL = 'https://reportapi02.55pbx.com:50500/api/pbx/reports/metrics';
const TOKEN = 'SEU_TOKEN_AQUI';  // ⚠️ SUBSTITUA pelo seu token real da API 55PBX

export function formatarDataParaAPI(date) {
  return date.toDateString() + ' 00:00:00 GMT-0300';
}

export async function fetchReport01(dateStart, dateEnd) {
  const url = `${API_BASE_URL}/${encodeURIComponent(dateStart)}/${encodeURIComponent(dateEnd)}/all_queues/all_numbers/all_agent/report_01`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro na API 55PBX:', error);
    throw new Error(`Erro na API: ${error.response?.status || error.message}`);
  }
}