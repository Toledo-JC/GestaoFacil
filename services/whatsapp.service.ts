import { Linking, Platform } from 'react-native';
import { storageService } from './storage.service';
import { WhatsAppMessage } from '../types';

// ============================================
// WHATSAPP SERVICE - INTEGRAÇÃO WHATSAPP
// ============================================

export const whatsappService = {
  // ========== SEND MESSAGES ==========

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(message);
      
      const url = Platform.select({
        ios: `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`,
        android: `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`,
        default: `https://wa.me/${cleanPhone}?text=${encodedMessage}`,
      });

      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        // Fallback para web
        const webUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  },

  async sendBudget(
    clientId: number,
    budgetId: number,
    phone: string,
    budgetNumber: string,
    total: number
  ): Promise<boolean> {
    const message = `Olá! 👋\n\nSegue o orçamento *${budgetNumber}*:\n\n💰 Valor: R$ ${total.toFixed(2)}\n\nPara aprovar, responda esta mensagem.\n\nObrigado!`;
    
    const sent = await this.sendMessage(phone, message);
    
    if (sent) {
      await this.logMessage({
        clientId,
        budgetId,
        type: 'BUDGET',
        message,
      });
    }
    
    return sent;
  },

  async sendReminder(
    clientId: number,
    serviceOrderId: number,
    phone: string,
    osNumber: string,
    scheduledDate: string
  ): Promise<boolean> {
    const date = new Date(scheduledDate);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const message = `Olá! 👋\n\nLembrando do nosso atendimento:\n\n📋 OS: *${osNumber}*\n📅 Data: ${formattedDate}\n🕐 Horário: ${formattedTime}\n\nAguardo você!\n\nAté lá! 😊`;
    
    const sent = await this.sendMessage(phone, message);
    
    if (sent) {
      await this.logMessage({
        clientId,
        serviceOrderId,
        type: 'REMINDER',
        message,
      });
    }
    
    return sent;
  },

  async sendConfirmation(
    clientId: number,
    serviceOrderId: number,
    phone: string,
    osNumber: string
  ): Promise<boolean> {
    const message = `Olá! 👋\n\n✅ Serviço concluído!\n\n📋 OS: *${osNumber}*\n\nFoi um prazer atendê-lo!\n\nConte sempre conosco! 😊`;
    
    const sent = await this.sendMessage(phone, message);
    
    if (sent) {
      await this.logMessage({
        clientId,
        serviceOrderId,
        type: 'CONFIRMATION',
        message,
      });
    }
    
    return sent;
  },

  async sendUpdate(
    clientId: number,
    serviceOrderId: number,
    phone: string,
    osNumber: string,
    update: string
  ): Promise<boolean> {
    const message = `Olá! 👋\n\n📋 OS: *${osNumber}*\n\n📢 Atualização:\n${update}\n\nQualquer dúvida, estou à disposição!`;
    
    const sent = await this.sendMessage(phone, message);
    
    if (sent) {
      await this.logMessage({
        clientId,
        serviceOrderId,
        type: 'UPDATE',
        message,
      });
    }
    
    return sent;
  },

  async requestFeedback(
    clientId: number,
    serviceOrderId: number,
    phone: string,
    osNumber: string
  ): Promise<boolean> {
    const message = `Olá! 👋\n\n📋 OS: *${osNumber}*\n\nComo foi sua experiência com nosso atendimento?\n\n⭐ Avalie de 1 a 5:\n5 - Excelente\n4 - Muito bom\n3 - Bom\n2 - Regular\n1 - Ruim\n\nSeu feedback é muito importante!`;
    
    const sent = await this.sendMessage(phone, message);
    
    if (sent) {
      await this.logMessage({
        clientId,
        serviceOrderId,
        type: 'FEEDBACK',
        message,
      });
    }
    
    return sent;
  },

  // ========== MESSAGE LOG ==========

  async logMessage(data: Omit<WhatsAppMessage, 'id' | 'sentAt'>): Promise<void> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const messages = await storageService.webGet<WhatsAppMessage[]>('whatsapp_messages') || [];
      const newMessage: WhatsAppMessage = {
        id: Date.now(),
        ...data,
        sentAt: now,
      };
      messages.push(newMessage);
      await storageService.webSet('whatsapp_messages', messages);
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync(
      'INSERT INTO whatsapp_messages (client_id, budget_id, service_order_id, type, message, sent_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        data.clientId,
        data.budgetId || null,
        data.serviceOrderId || null,
        data.type,
        data.message,
        now,
      ]
    );
  },

  async getMessages(clientId?: number): Promise<WhatsAppMessage[]> {
    if (Platform.OS === 'web') {
      const messages = await storageService.webGet<WhatsAppMessage[]>('whatsapp_messages') || [];
      return clientId ? messages.filter(m => m.clientId === clientId) : messages;
    }

    const db = storageService.getDatabase();
    const query = clientId
      ? 'SELECT * FROM whatsapp_messages WHERE client_id = ? ORDER BY sent_at DESC'
      : 'SELECT * FROM whatsapp_messages ORDER BY sent_at DESC';
    
    const params = clientId ? [clientId] : [];
    const rows = await db.getAllAsync(query, params);
    
    return rows.map((row: any) => ({
      id: row.id,
      clientId: row.client_id,
      budgetId: row.budget_id,
      serviceOrderId: row.service_order_id,
      type: row.type,
      message: row.message,
      sentAt: row.sent_at,
    }));
  },
};
