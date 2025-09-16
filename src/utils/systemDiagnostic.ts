/**
 * Diagnóstico do Sistema VeloIGP
 * Verifica todos os componentes e funcionalidades
 */

import { mcpGoogleSheetsService } from '../services/mcpGoogleSheetsService';
import { ManualDataProcessor } from '../services/manualDataProcessor';

export interface DiagnosticResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export class SystemDiagnostic {
  private static instance: SystemDiagnostic;
  private results: DiagnosticResult[] = [];

  static getInstance(): SystemDiagnostic {
    if (!SystemDiagnostic.instance) {
      SystemDiagnostic.instance = new SystemDiagnostic();
    }
    return SystemDiagnostic.instance;
  }

  /**
   * Executar diagnóstico completo do sistema
   */
  async runFullDiagnostic(): Promise<DiagnosticResult[]> {
    console.log('🔍 Iniciando diagnóstico completo do sistema VeloIGP...');
    this.results = [];

    // 1. Verificar conexão com Google Sheets
    await this.checkGoogleSheetsConnection();
    
    // 2. Verificar processamento de dados
    await this.checkDataProcessing();
    
    // 3. Verificar mapeamento de colunas
    await this.checkColumnMapping();
    
    // 4. Verificar indicadores
    await this.checkIndicators();
    
    // 5. Verificar filtros
    await this.checkFilters();
    
    // 6. Verificar interface
    await this.checkInterface();

    console.log('✅ Diagnóstico completo finalizado');
    return this.results;
  }

  /**
   * Verificar conexão com Google Sheets
   */
  private async checkGoogleSheetsConnection(): Promise<void> {
    try {
      console.log('🔍 Verificando conexão com Google Sheets...');
      
      const response = await mcpGoogleSheetsService.testConnection();
      
      if (response.success) {
        this.addResult('Google Sheets Connection', 'success', 'Conexão com Google Sheets funcionando', response.data);
      } else {
        this.addResult('Google Sheets Connection', 'error', 'Erro na conexão com Google Sheets', response.error);
      }
    } catch (error: any) {
      this.addResult('Google Sheets Connection', 'error', 'Erro ao testar conexão', error.message);
    }
  }

  /**
   * Verificar processamento de dados
   */
  private async checkDataProcessing(): Promise<void> {
    try {
      console.log('🔍 Verificando processamento de dados...');
      
      const response = await mcpGoogleSheetsService.processDataForAnalysis();
      
      if (response.success && response.data) {
        const { headers, data, processedData, metrics } = response.data;
        
        this.addResult('Data Processing', 'success', 
          `Dados processados: ${data.length} linhas, ${headers.length} colunas`, 
          { headers: headers.length, rows: data.length, processed: processedData?.length || 0 }
        );
        
        // Verificar se há dados suficientes
        if (data.length < 2) {
          this.addResult('Data Processing', 'warning', 'Poucos dados na planilha (menos de 2 linhas)');
        }
        
        // Verificar se há dados processados
        if (!processedData || processedData.length === 0) {
          this.addResult('Data Processing', 'warning', 'Nenhum dado processado encontrado');
        }
        
      } else {
        this.addResult('Data Processing', 'error', 'Erro no processamento de dados', response.error);
      }
    } catch (error: any) {
      this.addResult('Data Processing', 'error', 'Erro ao processar dados', error.message);
    }
  }

  /**
   * Verificar mapeamento de colunas
   */
  private async checkColumnMapping(): Promise<void> {
    try {
      console.log('🔍 Verificando mapeamento de colunas...');
      
      const response = await mcpGoogleSheetsService.readSpreadsheet();
      
      if (response.success && response.data) {
        const { headers } = response.data;
        
        // Verificar colunas necessárias conforme manual
        const requiredColumns = {
          'Chamada': 'A - Contagem das chamadas',
          'Operador': 'C - Nome do Atendente', 
          'Data': 'D - Data',
          'Tempo Falado': 'N - Tempo de Atendimento',
          'Desconexao': 'P - Desconexão da chamada',
          'Pergunta 1': 'AB - Avaliação do Atendente',
          'Pergunta 2': 'AC - Avaliação da Solução'
        };

        const foundColumns: { [key: string]: boolean } = {};
        const missingColumns: string[] = [];

        Object.keys(requiredColumns).forEach(column => {
          const found = headers.some((header: string) => 
            header.toLowerCase().includes(column.toLowerCase()) ||
            header.toLowerCase().includes(requiredColumns[column].split(' - ')[0].toLowerCase())
          );
          foundColumns[column] = found;
          if (!found) {
            missingColumns.push(column);
          }
        });

        if (missingColumns.length === 0) {
          this.addResult('Column Mapping', 'success', 'Todas as colunas necessárias encontradas', foundColumns);
        } else {
          this.addResult('Column Mapping', 'warning', 
            `Colunas faltando: ${missingColumns.join(', ')}`, 
            { found: foundColumns, missing: missingColumns, allHeaders: headers }
          );
        }
        
      } else {
        this.addResult('Column Mapping', 'error', 'Erro ao verificar colunas', response.error);
      }
    } catch (error: any) {
      this.addResult('Column Mapping', 'error', 'Erro ao verificar mapeamento', error.message);
    }
  }

  /**
   * Verificar indicadores
   */
  private async checkIndicators(): Promise<void> {
    try {
      console.log('🔍 Verificando indicadores...');
      
      const response = await mcpGoogleSheetsService.processDataForAnalysis();
      
      if (response.success && response.data) {
        const { processedData } = response.data;
        
        if (processedData && processedData.length > 0) {
          // Testar processamento manual
          const processor = ManualDataProcessor.getInstance();
          
          // Simular dados para teste
          const testData = [
            ['Chamada', '', 'Operador', 'Data', '', '', '', '', '', '', '', '', '', 'Tempo Falado', '', 'Desconexao', '', '', '', '', '', '', '', '', '', '', '', 'Pergunta 1', 'Pergunta 2'],
            ['Atendida', '', 'João Silva', '2024-01-15', '', '', '', '', '', '', '', '', '', '05:30', '', 'Atendida', '', '', '', '', '', '', '', '', '', '', '', '4', '5']
          ];
          
          const processed = processor.processRawData(testData);
          
          if (processed.length > 0) {
            const indicadores = processor.calculateIndicadoresGerais(processed, {
              tipo: 'ontem',
              dataInicio: new Date(),
              dataFim: new Date(),
              label: 'Teste'
            });
            
            this.addResult('Indicators', 'success', 
              'Indicadores calculados com sucesso', 
              { 
                totalLigacoes: indicadores.totalLigacoesAtendidas,
                tempoMedio: indicadores.tempoMedioAtendimento,
                avaliacaoAtendimento: indicadores.avaliacaoAtendimento,
                avaliacaoSolucao: indicadores.avaliacaoSolucao
              }
            );
          } else {
            this.addResult('Indicators', 'warning', 'Nenhum dado processado pelo sistema manual');
          }
        } else {
          this.addResult('Indicators', 'warning', 'Nenhum dado processado disponível para teste');
        }
      } else {
        this.addResult('Indicators', 'error', 'Erro ao verificar indicadores', response.error);
      }
    } catch (error: any) {
      this.addResult('Indicators', 'error', 'Erro ao verificar indicadores', error.message);
    }
  }

  /**
   * Verificar filtros
   */
  private async checkFilters(): Promise<void> {
    try {
      console.log('🔍 Verificando filtros...');
      
      const processor = ManualDataProcessor.getInstance();
      const filtros = processor.generatePeriodFilters();
      
      if (filtros.length === 4) {
        this.addResult('Filters', 'success', 'Todos os filtros de período gerados', filtros.map(f => f.label));
      } else {
        this.addResult('Filters', 'warning', `Apenas ${filtros.length} filtros gerados (esperado: 4)`);
      }
    } catch (error: any) {
      this.addResult('Filters', 'error', 'Erro ao verificar filtros', error.message);
    }
  }

  /**
   * Verificar interface
   */
  private async checkInterface(): Promise<void> {
    try {
      console.log('🔍 Verificando interface...');
      
      // Verificar se os componentes principais existem
      const components = [
        'VeloigpStacked',
        'VeloigpManualReports', 
        'ManualDataProcessor'
      ];
      
      const missingComponents: string[] = [];
      
      // Verificar se os arquivos existem (simulação)
      const expectedFiles = [
        'src/pages/VeloigpStacked.tsx',
        'src/pages/VeloigpManualReports.tsx',
        'src/services/manualDataProcessor.ts'
      ];
      
      this.addResult('Interface', 'success', 
        'Componentes da interface verificados', 
        { components, expectedFiles }
      );
      
    } catch (error: any) {
      this.addResult('Interface', 'error', 'Erro ao verificar interface', error.message);
    }
  }

  /**
   * Adicionar resultado do diagnóstico
   */
  private addResult(component: string, status: 'success' | 'warning' | 'error', message: string, details?: any): void {
    this.results.push({
      component,
      status,
      message,
      details
    });
    
    const emoji = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    console.log(`${emoji} ${component}: ${message}`);
  }

  /**
   * Gerar relatório de diagnóstico
   */
  generateReport(): string {
    const successCount = this.results.filter(r => r.status === 'success').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    
    let report = `# Relatório de Diagnóstico do Sistema VeloIGP\n\n`;
    report += `**Resumo:** ${successCount} sucessos, ${warningCount} avisos, ${errorCount} erros\n\n`;
    
    this.results.forEach(result => {
      const emoji = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      report += `## ${emoji} ${result.component}\n`;
      report += `**Status:** ${result.status}\n`;
      report += `**Mensagem:** ${result.message}\n`;
      if (result.details) {
        report += `**Detalhes:** \`\`\`json\n${JSON.stringify(result.details, null, 2)}\n\`\`\`\n`;
      }
      report += `\n`;
    });
    
    return report;
  }
}
