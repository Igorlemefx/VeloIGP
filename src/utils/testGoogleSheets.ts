// Teste da API Google Sheets
export const testGoogleSheetsAPI = async () => {
  const apiKey = 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A';
  const spreadsheetId = '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM';
  
  try {
    console.log('🧪 Testando API Google Sheets...');
    console.log('📊 Spreadsheet ID:', spreadsheetId);
    console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:AN1?key=${apiKey}`;
    console.log('🌐 URL:', url);
    
    const response = await fetch(url);
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
      return { success: false, error: errorText };
    }
    
    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Erro no teste:', error);
    return { success: false, error: error.message };
  }
};

// Teste de permissões da planilha
export const testSpreadsheetPermissions = async () => {
  const apiKey = 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A';
  const spreadsheetId = '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM';
  
  try {
    console.log('🔐 Testando permissões da planilha...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`;
    console.log('🌐 URL:', url);
    
    const response = await fetch(url);
    console.log('📡 Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro de permissão:', errorText);
      return { success: false, error: errorText };
    }
    
    const data = await response.json();
    console.log('✅ Metadados da planilha:', data);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Erro no teste de permissões:', error);
    return { success: false, error: error.message };
  }
};
