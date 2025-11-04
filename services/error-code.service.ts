import { storageService } from './storage.service';
import { ErrorCode, ErrorCodeSeverity, ErrorCodeSearch } from '../types';

// ============================================
// ERROR CODE CATALOG SERVICE
// ============================================

export const errorCodeService = {
  // ========== CRUD OPERATIONS ==========

  async create(errorCode: Omit<ErrorCode, 'id' | 'useCount' | 'createdAt' | 'updatedAt'>): Promise<{ data: ErrorCode | null; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const codes = (await storageService.webGet<ErrorCode[]>('error_codes')) || [];
        const newCode: ErrorCode = {
          ...errorCode,
          id: Date.now(),
          useCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        codes.push(newCode);
        await storageService.webSet('error_codes', codes);
        return { data: newCode, error: null };
      }

      const db = storageService.getDatabase();
      const result = await db.runAsync(
        `INSERT INTO error_codes (segment, equipment_type, brand, model, error_code, description, cause, solution, severity, technical_notes, video_url, document_url, tags, active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          errorCode.segment,
          errorCode.equipmentType || null,
          errorCode.brand || null,
          errorCode.model || null,
          errorCode.errorCode,
          errorCode.description,
          errorCode.cause || null,
          errorCode.solution || null,
          errorCode.severity || null,
          errorCode.technicalNotes || null,
          errorCode.videoUrl || null,
          errorCode.documentUrl || null,
          errorCode.tags || null,
          errorCode.active ? 1 : 0,
        ]
      );

      const created = await db.getFirstAsync<any>(
        'SELECT * FROM error_codes WHERE id = ?',
        [result.lastInsertRowId]
      );

      if (!created) return { data: null, error: 'Failed to create error code' };

      return {
        data: this.mapRow(created),
        error: null,
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async search(params: ErrorCodeSearch): Promise<{ data: ErrorCode[]; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const codes = (await storageService.webGet<ErrorCode[]>('error_codes')) || [];
        let filtered = codes;

        if (params.query) {
          const lower = params.query.toLowerCase();
          filtered = filtered.filter(c =>
            c.errorCode.toLowerCase().includes(lower) ||
            c.description.toLowerCase().includes(lower) ||
            c.cause?.toLowerCase().includes(lower) ||
            c.solution?.toLowerCase().includes(lower)
          );
        }

        if (params.segment) {
          filtered = filtered.filter(c => c.segment === params.segment);
        }

        if (params.brand) {
          filtered = filtered.filter(c => c.brand === params.brand);
        }

        if (params.severity) {
          filtered = filtered.filter(c => c.severity === params.severity);
        }

        return { data: filtered, error: null };
      }

      const db = storageService.getDatabase();
      const conditions: string[] = ['active = 1'];
      const values: any[] = [];

      if (params.query) {
        conditions.push('(error_code LIKE ? OR description LIKE ? OR cause LIKE ? OR solution LIKE ?)');
        const search = `%${params.query}%`;
        values.push(search, search, search, search);
      }

      if (params.segment) {
        conditions.push('segment = ?');
        values.push(params.segment);
      }

      if (params.brand) {
        conditions.push('brand = ?');
        values.push(params.brand);
      }

      if (params.severity) {
        conditions.push('severity = ?');
        values.push(params.severity);
      }

      const query = `
        SELECT * FROM error_codes 
        WHERE ${conditions.join(' AND ')} 
        ORDER BY use_count DESC, error_code ASC
        LIMIT 100
      `;

      const rows = await db.getAllAsync<any>(query, values);

      return { data: rows.map(this.mapRow), error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async getAll(segment?: string): Promise<{ data: ErrorCode[]; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const codes = (await storageService.webGet<ErrorCode[]>('error_codes')) || [];
        const filtered = segment ? codes.filter(c => c.segment === segment) : codes;
        return { data: filtered, error: null };
      }

      const db = storageService.getDatabase();
      const query = segment
        ? 'SELECT * FROM error_codes WHERE segment = ? ORDER BY use_count DESC, error_code ASC'
        : 'SELECT * FROM error_codes ORDER BY use_count DESC, error_code ASC';

      const rows = await db.getAllAsync<any>(query, segment ? [segment] : []);

      return { data: rows.map(this.mapRow), error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async getById(id: number): Promise<{ data: ErrorCode | null; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const codes = (await storageService.webGet<ErrorCode[]>('error_codes')) || [];
        const code = codes.find(c => c.id === id);
        return { data: code || null, error: null };
      }

      const db = storageService.getDatabase();
      const row = await db.getFirstAsync<any>('SELECT * FROM error_codes WHERE id = ?', [id]);

      if (!row) return { data: null, error: 'Error code not found' };

      return { data: this.mapRow(row), error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async incrementUseCount(id: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const codes = (await storageService.webGet<ErrorCode[]>('error_codes')) || [];
        const code = codes.find(c => c.id === id);
        if (code) {
          code.useCount++;
          code.lastUsedAt = new Date().toISOString();
          await storageService.webSet('error_codes', codes);
        }
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync(
        'UPDATE error_codes SET use_count = use_count + 1, last_used_at = ? WHERE id = ?',
        [new Date().toISOString(), id]
      );

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async delete(id: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const codes = (await storageService.webGet<ErrorCode[]>('error_codes')) || [];
        const filtered = codes.filter(c => c.id !== id);
        await storageService.webSet('error_codes', filtered);
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync('DELETE FROM error_codes WHERE id = ?', [id]);

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // ========== UTILITIES ==========

  mapRow(row: any): ErrorCode {
    return {
      id: row.id,
      segment: row.segment,
      equipmentType: row.equipment_type,
      brand: row.brand,
      model: row.model,
      errorCode: row.error_code,
      description: row.description,
      cause: row.cause,
      solution: row.solution,
      severity: row.severity,
      technicalNotes: row.technical_notes,
      videoUrl: row.video_url,
      documentUrl: row.document_url,
      tags: row.tags,
      active: Boolean(row.active),
      useCount: row.use_count || 0,
      lastUsedAt: row.last_used_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};
