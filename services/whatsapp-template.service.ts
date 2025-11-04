import { storageService } from './storage.service';
import { WhatsAppTemplate, WhatsAppTemplateCategory } from '../types';

// ============================================
// WHATSAPP TEMPLATE SERVICE
// ============================================

export const whatsappTemplateService = {
  // ========== CRUD OPERATIONS ==========

  async create(template: Omit<WhatsAppTemplate, 'id' | 'useCount' | 'createdAt' | 'updatedAt'>): Promise<{ data: WhatsAppTemplate | null; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const templates = (await storageService.webGet<WhatsAppTemplate[]>('whatsapp_templates')) || [];
        const newTemplate: WhatsAppTemplate = {
          ...template,
          id: Date.now(),
          useCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        templates.push(newTemplate);
        await storageService.webSet('whatsapp_templates', templates);
        return { data: newTemplate, error: null };
      }

      const db = storageService.getDatabase();
      const result = await db.runAsync(
        `INSERT INTO whatsapp_templates (name, category, title, message, variables, active) VALUES (?, ?, ?, ?, ?, ?)`,
        [template.name, template.category, template.title, template.message, template.variables || null, template.active ? 1 : 0]
      );

      const created = await db.getFirstAsync<any>(
        'SELECT * FROM whatsapp_templates WHERE id = ?',
        [result.lastInsertRowId]
      );

      if (!created) return { data: null, error: 'Failed to create template' };

      return {
        data: {
          id: created.id,
          name: created.name,
          category: created.category,
          title: created.title,
          message: created.message,
          variables: created.variables,
          active: Boolean(created.active),
          useCount: created.use_count || 0,
          lastUsedAt: created.last_used_at,
          createdAt: created.created_at,
          updatedAt: created.updated_at,
        },
        error: null,
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getAll(category?: WhatsAppTemplateCategory): Promise<{ data: WhatsAppTemplate[]; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const templates = (await storageService.webGet<WhatsAppTemplate[]>('whatsapp_templates')) || [];
        const filtered = category ? templates.filter(t => t.category === category) : templates;
        return { data: filtered, error: null };
      }

      const db = storageService.getDatabase();
      const query = category
        ? 'SELECT * FROM whatsapp_templates WHERE category = ? ORDER BY use_count DESC, name ASC'
        : 'SELECT * FROM whatsapp_templates ORDER BY use_count DESC, name ASC';

      const rows = await db.getAllAsync<any>(query, category ? [category] : []);

      const templates: WhatsAppTemplate[] = rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        title: row.title,
        message: row.message,
        variables: row.variables,
        active: Boolean(row.active),
        useCount: row.use_count || 0,
        lastUsedAt: row.last_used_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return { data: templates, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async getById(id: number): Promise<{ data: WhatsAppTemplate | null; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const templates = (await storageService.webGet<WhatsAppTemplate[]>('whatsapp_templates')) || [];
        const template = templates.find(t => t.id === id);
        return { data: template || null, error: null };
      }

      const db = storageService.getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM whatsapp_templates WHERE id = ?',
        [id]
      );

      if (!row) return { data: null, error: 'Template not found' };

      return {
        data: {
          id: row.id,
          name: row.name,
          category: row.category,
          title: row.title,
          message: row.message,
          variables: row.variables,
          active: Boolean(row.active),
          useCount: row.use_count || 0,
          lastUsedAt: row.last_used_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
        error: null,
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async update(id: number, template: Partial<WhatsAppTemplate>): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const templates = (await storageService.webGet<WhatsAppTemplate[]>('whatsapp_templates')) || [];
        const index = templates.findIndex(t => t.id === id);
        if (index >= 0) {
          templates[index] = { ...templates[index], ...template, updatedAt: new Date().toISOString() };
          await storageService.webSet('whatsapp_templates', templates);
        }
        return { error: null };
      }

      const db = storageService.getDatabase();
      const updates: string[] = [];
      const values: any[] = [];

      if (template.name !== undefined) { updates.push('name = ?'); values.push(template.name); }
      if (template.category !== undefined) { updates.push('category = ?'); values.push(template.category); }
      if (template.title !== undefined) { updates.push('title = ?'); values.push(template.title); }
      if (template.message !== undefined) { updates.push('message = ?'); values.push(template.message); }
      if (template.variables !== undefined) { updates.push('variables = ?'); values.push(template.variables); }
      if (template.active !== undefined) { updates.push('active = ?'); values.push(template.active ? 1 : 0); }

      if (updates.length > 0) {
        updates.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);

        await db.runAsync(
          `UPDATE whatsapp_templates SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async delete(id: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const templates = (await storageService.webGet<WhatsAppTemplate[]>('whatsapp_templates')) || [];
        const filtered = templates.filter(t => t.id !== id);
        await storageService.webSet('whatsapp_templates', filtered);
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync('DELETE FROM whatsapp_templates WHERE id = ?', [id]);

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async incrementUseCount(id: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const templates = (await storageService.webGet<WhatsAppTemplate[]>('whatsapp_templates')) || [];
        const template = templates.find(t => t.id === id);
        if (template) {
          template.useCount++;
          template.lastUsedAt = new Date().toISOString();
          await storageService.webSet('whatsapp_templates', templates);
        }
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync(
        'UPDATE whatsapp_templates SET use_count = use_count + 1, last_used_at = ? WHERE id = ?',
        [new Date().toISOString(), id]
      );

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // ========== TEMPLATE UTILITIES ==========

  applyVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  },

  extractVariables(template: string): string[] {
    const regex = /{{([^}]+)}}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
      matches.push(match[1]);
    }
    return [...new Set(matches)];
  },
};
