/**
 * Business segment configurations and technical fields
 */

export type SegmentType = 
  | 'Informática'
  | 'Eletrônica'
  | 'Refrigeração'
  | 'Elétrica'
  | 'Hidráulica'
  | 'Automotivo'
  | 'Celulares'
  | 'Eletrodomésticos'
  | 'Outro';

export interface TechnicalField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  unit?: string;
  placeholder?: string;
}

export const SEGMENT_TECHNICAL_FIELDS: Record<string, TechnicalField[]> = {
  Refrigeração: [
    { key: 'capacidade_btus', label: 'Capacidade', type: 'number', unit: 'BTUs', placeholder: '12000' },
    { key: 'tipo_gas', label: 'Tipo de Gás', type: 'select', options: ['R22', 'R410A', 'R32', 'R134a', 'R404A', 'Outro'] },
    { key: 'voltagem', label: 'Voltagem', type: 'select', options: ['110V', '220V', 'Bifásico', 'Trifásico'] },
    { key: 'tipo_instalacao', label: 'Tipo', type: 'select', options: ['Split', 'Janela', 'Cassete', 'Piso-Teto', 'VRF'] },
  ],
  
  Automotivo: [
    { key: 'ano', label: 'Ano', type: 'number', placeholder: '2023' },
    { key: 'placa', label: 'Placa', type: 'text', placeholder: 'ABC-1234' },
    { key: 'chassi', label: 'Chassi', type: 'text', placeholder: '9BWAA45U08B123456' },
    { key: 'km_atual', label: 'Quilometragem', type: 'number', unit: 'km', placeholder: '50000' },
    { key: 'combustivel', label: 'Combustível', type: 'select', options: ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'GNV', 'Elétrico', 'Híbrido'] },
    { key: 'cor', label: 'Cor', type: 'text', placeholder: 'Prata' },
  ],
  
  Informática: [
    { key: 'processador', label: 'Processador', type: 'text', placeholder: 'Intel Core i7' },
    { key: 'ram_gb', label: 'Memória RAM', type: 'number', unit: 'GB', placeholder: '16' },
    { key: 'hd_tipo', label: 'Tipo de HD', type: 'select', options: ['SSD', 'HDD', 'SSD + HDD', 'M.2 NVMe'] },
    { key: 'hd_capacidade_gb', label: 'Capacidade HD', type: 'number', unit: 'GB', placeholder: '512' },
    { key: 'sistema_operacional', label: 'Sistema Operacional', type: 'select', options: ['Windows 11', 'Windows 10', 'macOS', 'Linux', 'Chrome OS'] },
  ],
  
  Elétrica: [
    { key: 'tensao', label: 'Tensão', type: 'select', options: ['110V', '220V', '380V', 'Bifásico', 'Trifásico'] },
    { key: 'potencia', label: 'Potência', type: 'number', unit: 'W', placeholder: '1000' },
    { key: 'tipo_instalacao', label: 'Tipo de Instalação', type: 'select', options: ['Embutida', 'Aparente', 'Subterrânea'] },
    { key: 'disjuntor', label: 'Disjuntor', type: 'number', unit: 'A', placeholder: '25' },
  ],
  
  Hidráulica: [
    { key: 'vazao', label: 'Vazão', type: 'number', unit: 'L/min', placeholder: '10' },
    { key: 'pressao', label: 'Pressão', type: 'number', unit: 'PSI', placeholder: '40' },
    { key: 'material', label: 'Material', type: 'select', options: ['PVC', 'Cobre', 'PEX', 'PPR', 'Aço Galvanizado'] },
    { key: 'diametro', label: 'Diâmetro', type: 'text', placeholder: '3/4"' },
  ],
  
  Celulares: [
    { key: 'sistema', label: 'Sistema', type: 'select', options: ['Android', 'iOS'] },
    { key: 'versao_sistema', label: 'Versão do Sistema', type: 'text', placeholder: '14.0' },
    { key: 'armazenamento_gb', label: 'Armazenamento', type: 'number', unit: 'GB', placeholder: '128' },
    { key: 'ram_gb', label: 'Memória RAM', type: 'number', unit: 'GB', placeholder: '6' },
    { key: 'imei', label: 'IMEI', type: 'text', placeholder: '123456789012345' },
  ],
  
  Eletrodomésticos: [
    { key: 'capacidade', label: 'Capacidade', type: 'text', placeholder: '500L, 12kg, etc' },
    { key: 'voltagem', label: 'Voltagem', type: 'select', options: ['110V', '220V', 'Bivolt'] },
    { key: 'potencia', label: 'Potência', type: 'number', unit: 'W', placeholder: '1500' },
    { key: 'classe_energetica', label: 'Classe Energética', type: 'select', options: ['A', 'B', 'C', 'D', 'E'] },
  ],
};

export function getTechnicalFieldsForSegment(segment: string): TechnicalField[] {
  return SEGMENT_TECHNICAL_FIELDS[segment] || [];
}
