/**
 * CEP lookup service using ViaCEP API
 */

export interface AddressData {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export async function fetchAddressByCEP(cep: string): Promise<AddressData | null> {
  try {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return null;

    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
    
    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.erro) return null;

    return {
      cep: data.cep,
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch (error) {
    console.error('Error fetching CEP:', error);
    return null;
  }
}
