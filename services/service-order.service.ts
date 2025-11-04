import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { ServiceOrder, ServiceOrderItem, ServiceOrderPhoto, ServiceOrderActivity, ServiceOrderCollaborator } from '../types';

// ============================================
// SERVICE ORDER SERVICE - CRUD DE OSs
// ============================================

export const serviceOrderService = {
  // ========== SERVICE ORDERS ==========

  async getAll(): Promise<ServiceOrder[]> {
    if (Platform.OS === 'web') {
      const orders = await storageService.webGet<ServiceOrder[]>('service_orders');
      return orders || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM service_orders ORDER BY created_at DESC');
    return rows.map(this.mapServiceOrder);
  },

  async getById(id: number): Promise<ServiceOrder | null> {
    if (Platform.OS === 'web') {
      const orders = await storageService.webGet<ServiceOrder[]>('service_orders');
      return orders?.find(o => o.id === id) || null;
    }

    const db = storageService.getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM service_orders WHERE id = ?', [id]);
    return row ? this.mapServiceOrder(row) : null;
  },

  async getByClient(clientId: number): Promise<ServiceOrder[]> {
    if (Platform.OS === 'web') {
      const orders = await storageService.webGet<ServiceOrder[]>('service_orders');
      return orders?.filter(o => o.clientId === clientId) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM service_orders WHERE client_id = ? ORDER BY created_at DESC',
      [clientId]
    );
    return rows.map(this.mapServiceOrder);
  },

  async getByStatus(status: ServiceOrder['status']): Promise<ServiceOrder[]> {
    if (Platform.OS === 'web') {
      const orders = await storageService.webGet<ServiceOrder[]>('service_orders');
      return orders?.filter(o => o.status === status) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM service_orders WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    return rows.map(this.mapServiceOrder);
  },

  async create(order: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceOrder> {
    const now = new Date().toISOString();
    const osNumber = await this.generateOSNumber();

    if (Platform.OS === 'web') {
      const orders = await storageService.webGet<ServiceOrder[]>('service_orders') || [];
      const newOrder: ServiceOrder = {
        id: Date.now(),
        ...order,
        osNumber,
        createdAt: now,
        updatedAt: now,
      };
      orders.push(newOrder);
      await storageService.webSet('service_orders', orders);
      return newOrder;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO service_orders (
        os_number, budget_id, client_id, equipment_id, title, description,
        priority, status, scheduled_date, estimated_hours,
        subtotal, discount, total, payment_status, warranty_days,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        osNumber,
        order.budgetId || null,
        order.clientId,
        order.equipmentId || null,
        order.title,
        order.description || null,
        order.priority,
        order.status,
        order.scheduledDate || null,
        order.estimatedHours || null,
        order.subtotal,
        order.discount,
        order.total,
        order.paymentStatus,
        order.warrantyDays,
        now,
        now,
      ]
    );

    const created = await this.getById(result.lastInsertRowId);
    if (!created) throw new Error('Failed to create service order');
    return created;
  },

  async update(id: number, data: Partial<ServiceOrder>): Promise<void> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const orders = await storageService.webGet<ServiceOrder[]>('service_orders') || [];
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index] = { ...orders[index], ...data, updatedAt: now };
        await storageService.webSet('service_orders', orders);
      }
      return;
    }

    const db = storageService.getDatabase();
    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${this.camelToSnake(key)} = ?`);
    
    const values = Object.entries(data)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE service_orders SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    }
  },

  async delete(id: number): Promise<void> {
    if (Platform.OS === 'web') {
      const orders = await storageService.webGet<ServiceOrder[]>('service_orders') || [];
      await storageService.webSet('service_orders', orders.filter(o => o.id !== id));
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync('DELETE FROM service_orders WHERE id = ?', [id]);
  },

  async start(id: number): Promise<void> {
    const now = new Date().toISOString();
    await this.update(id, {
      status: 'IN_PROGRESS',
      startedAt: now,
    });
  },

  async complete(id: number, technicalReport?: string, rating?: number): Promise<void> {
    const now = new Date().toISOString();
    await this.update(id, {
      status: 'COMPLETED',
      completedAt: now,
      technicalReport,
      rating,
    });
  },

  async cancel(id: number): Promise<void> {
    await this.update(id, { status: 'CANCELLED' });
  },

  // ========== SERVICE ORDER ITEMS ==========

  async getItems(serviceOrderId: number): Promise<ServiceOrderItem[]> {
    if (Platform.OS === 'web') {
      const items = await storageService.webGet<ServiceOrderItem[]>(`os_items_${serviceOrderId}`);
      return items || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM service_order_items WHERE service_order_id = ? ORDER BY created_at',
      [serviceOrderId]
    );
    return rows.map(this.mapServiceOrderItem);
  },

  async addItem(item: Omit<ServiceOrderItem, 'id' | 'createdAt'>): Promise<ServiceOrderItem> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const items = await storageService.webGet<ServiceOrderItem[]>(`os_items_${item.serviceOrderId}`) || [];
      const newItem: ServiceOrderItem = {
        id: Date.now(),
        ...item,
        createdAt: now,
      };
      items.push(newItem);
      await storageService.webSet(`os_items_${item.serviceOrderId}`, items);
      await this.recalculateTotals(item.serviceOrderId);
      return newItem;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO service_order_items (
        service_order_id, type, description, quantity, unit_price, total, used, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.serviceOrderId,
        item.type,
        item.description,
        item.quantity,
        item.unitPrice,
        item.total,
        item.used,
        item.notes || null,
        now,
      ]
    );

    await this.recalculateTotals(item.serviceOrderId);

    const items = await this.getItems(item.serviceOrderId);
    const created = items.find(i => i.id === result.lastInsertRowId);
    if (!created) throw new Error('Failed to create service order item');
    return created;
  },

  async deleteItem(id: number, serviceOrderId: number): Promise<void> {
    if (Platform.OS === 'web') {
      const items = await storageService.webGet<ServiceOrderItem[]>(`os_items_${serviceOrderId}`) || [];
      await storageService.webSet(`os_items_${serviceOrderId}`, items.filter(i => i.id !== id));
      await this.recalculateTotals(serviceOrderId);
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync('DELETE FROM service_order_items WHERE id = ?', [id]);
    await this.recalculateTotals(serviceOrderId);
  },

  // ========== PHOTOS ==========

  async getPhotos(serviceOrderId: number, type?: ServiceOrderPhoto['type']): Promise<ServiceOrderPhoto[]> {
    if (Platform.OS === 'web') {
      const photos = await storageService.webGet<ServiceOrderPhoto[]>(`os_photos_${serviceOrderId}`);
      const filtered = photos || [];
      return type ? filtered.filter(p => p.type === type) : filtered;
    }

    const db = storageService.getDatabase();
    const query = type
      ? 'SELECT * FROM service_order_photos WHERE service_order_id = ? AND type = ? ORDER BY created_at'
      : 'SELECT * FROM service_order_photos WHERE service_order_id = ? ORDER BY created_at';
    
    const params = type ? [serviceOrderId, type] : [serviceOrderId];
    const rows = await db.getAllAsync(query, params);
    return rows.map(this.mapServiceOrderPhoto);
  },

  async addPhoto(photo: Omit<ServiceOrderPhoto, 'id' | 'createdAt'>): Promise<ServiceOrderPhoto> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const photos = await storageService.webGet<ServiceOrderPhoto[]>(`os_photos_${photo.serviceOrderId}`) || [];
      const newPhoto: ServiceOrderPhoto = {
        id: Date.now(),
        ...photo,
        createdAt: now,
      };
      photos.push(newPhoto);
      await storageService.webSet(`os_photos_${photo.serviceOrderId}`, photos);
      return newPhoto;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      'INSERT INTO service_order_photos (service_order_id, type, uri, description, created_at) VALUES (?, ?, ?, ?, ?)',
      [photo.serviceOrderId, photo.type, photo.uri, photo.description || null, now]
    );

    const photos = await this.getPhotos(photo.serviceOrderId);
    const created = photos.find(p => p.id === result.lastInsertRowId);
    if (!created) throw new Error('Failed to add photo');
    return created;
  },

  async deletePhoto(id: number, serviceOrderId: number): Promise<void> {
    if (Platform.OS === 'web') {
      const photos = await storageService.webGet<ServiceOrderPhoto[]>(`os_photos_${serviceOrderId}`) || [];
      await storageService.webSet(`os_photos_${serviceOrderId}`, photos.filter(p => p.id !== id));
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync('DELETE FROM service_order_photos WHERE id = ?', [id]);
  },

  // ========== ACTIVITIES ==========

  async getActivities(serviceOrderId: number): Promise<ServiceOrderActivity[]> {
    if (Platform.OS === 'web') {
      const activities = await storageService.webGet<ServiceOrderActivity[]>(`os_activities_${serviceOrderId}`);
      return activities || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM service_order_activities WHERE service_order_id = ? ORDER BY created_at',
      [serviceOrderId]
    );
    return rows.map(this.mapServiceOrderActivity);
  },

  async addActivity(activity: Omit<ServiceOrderActivity, 'id' | 'createdAt'>): Promise<ServiceOrderActivity> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const activities = await storageService.webGet<ServiceOrderActivity[]>(`os_activities_${activity.serviceOrderId}`) || [];
      const newActivity: ServiceOrderActivity = {
        id: Date.now(),
        ...activity,
        createdAt: now,
      };
      activities.push(newActivity);
      await storageService.webSet(`os_activities_${activity.serviceOrderId}`, activities);
      return newActivity;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      'INSERT INTO service_order_activities (service_order_id, description, completed, created_at) VALUES (?, ?, ?, ?)',
      [activity.serviceOrderId, activity.description, activity.completed, now]
    );

    const activities = await this.getActivities(activity.serviceOrderId);
    const created = activities.find(a => a.id === result.lastInsertRowId);
    if (!created) throw new Error('Failed to add activity');
    return created;
  },

  async toggleActivity(id: number, serviceOrderId: number): Promise<void> {
    if (Platform.OS === 'web') {
      const activities = await storageService.webGet<ServiceOrderActivity[]>(`os_activities_${serviceOrderId}`) || [];
      const index = activities.findIndex(a => a.id === id);
      if (index !== -1) {
        const now = new Date().toISOString();
        activities[index].completed = activities[index].completed ? 0 : 1;
        activities[index].completedAt = activities[index].completed ? now : undefined;
        await storageService.webSet(`os_activities_${serviceOrderId}`, activities);
      }
      return;
    }

    const db = storageService.getDatabase();
    const activity = (await this.getActivities(serviceOrderId)).find(a => a.id === id);
    if (activity) {
      const now = new Date().toISOString();
      const completed = activity.completed ? 0 : 1;
      const completedAt = completed ? now : null;
      await db.runAsync(
        'UPDATE service_order_activities SET completed = ?, completed_at = ? WHERE id = ?',
        [completed, completedAt, id]
      );
    }
  },

  // ========== COLLABORATORS ==========

  async getCollaborators(serviceOrderId: number): Promise<ServiceOrderCollaborator[]> {
    if (Platform.OS === 'web') {
      const collaborators = await storageService.webGet<ServiceOrderCollaborator[]>(`os_collaborators_${serviceOrderId}`);
      return collaborators || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM service_order_collaborators WHERE service_order_id = ?',
      [serviceOrderId]
    );
    return rows.map(this.mapServiceOrderCollaborator);
  },

  async addCollaborator(collab: Omit<ServiceOrderCollaborator, 'id' | 'createdAt'>): Promise<ServiceOrderCollaborator> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const collaborators = await storageService.webGet<ServiceOrderCollaborator[]>(`os_collaborators_${collab.serviceOrderId}`) || [];
      const newCollab: ServiceOrderCollaborator = {
        id: Date.now(),
        ...collab,
        createdAt: now,
      };
      collaborators.push(newCollab);
      await storageService.webSet(`os_collaborators_${collab.serviceOrderId}`, collaborators);
      return newCollab;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      'INSERT INTO service_order_collaborators (service_order_id, collaborator_id, hours_worked, commission_amount, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [collab.serviceOrderId, collab.collaboratorId, collab.hoursWorked, collab.commissionAmount, collab.notes || null, now]
    );

    const collaborators = await this.getCollaborators(collab.serviceOrderId);
    const created = collaborators.find(c => c.id === result.lastInsertRowId);
    if (!created) throw new Error('Failed to add collaborator');
    return created;
  },

  async updateCollaborator(id: number, serviceOrderId: number, data: Partial<ServiceOrderCollaborator>): Promise<void> {
    if (Platform.OS === 'web') {
      const collaborators = await storageService.webGet<ServiceOrderCollaborator[]>(`os_collaborators_${serviceOrderId}`) || [];
      const index = collaborators.findIndex(c => c.id === id);
      if (index !== -1) {
        collaborators[index] = { ...collaborators[index], ...data };
        await storageService.webSet(`os_collaborators_${serviceOrderId}`, collaborators);
      }
      return;
    }

    const db = storageService.getDatabase();
    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'serviceOrderId' && key !== 'collaboratorId' && key !== 'createdAt')
      .map(key => `${this.camelToSnake(key)} = ?`);
    
    const values = Object.entries(data)
      .filter(([key]) => key !== 'id' && key !== 'serviceOrderId' && key !== 'collaboratorId' && key !== 'createdAt')
      .map(([, value]) => value);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE service_order_collaborators SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id]
      );
    }
  },

  // ========== HELPERS ==========

  async recalculateTotals(serviceOrderId: number): Promise<void> {
    const items = await this.getItems(serviceOrderId);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    
    const order = await this.getById(serviceOrderId);
    if (order) {
      const total = subtotal - order.discount;
      await this.update(serviceOrderId, { subtotal, total });
    }
  },

  async generateOSNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const orders = await this.getAll();
    const yearOrders = orders.filter(o => 
      o.osNumber.startsWith(`OS${year}`)
    );
    const nextNumber = yearOrders.length + 1;
    return `OS${year}${String(nextNumber).padStart(4, '0')}`;
  },

  mapServiceOrder(row: any): ServiceOrder {
    return {
      id: row.id,
      osNumber: row.os_number,
      budgetId: row.budget_id,
      clientId: row.client_id,
      equipmentId: row.equipment_id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      scheduledDate: row.scheduled_date,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours,
      subtotal: row.subtotal,
      discount: row.discount,
      total: row.total,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      warrantyDays: row.warranty_days,
      warrantyDescription: row.warranty_description,
      technicalReport: row.technical_report,
      customerFeedback: row.customer_feedback,
      rating: row.rating,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  mapServiceOrderItem(row: any): ServiceOrderItem {
    return {
      id: row.id,
      serviceOrderId: row.service_order_id,
      type: row.type,
      description: row.description,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      total: row.total,
      used: row.used,
      notes: row.notes,
      createdAt: row.created_at,
    };
  },

  mapServiceOrderPhoto(row: any): ServiceOrderPhoto {
    return {
      id: row.id,
      serviceOrderId: row.service_order_id,
      type: row.type,
      uri: row.uri,
      description: row.description,
      createdAt: row.created_at,
    };
  },

  mapServiceOrderActivity(row: any): ServiceOrderActivity {
    return {
      id: row.id,
      serviceOrderId: row.service_order_id,
      description: row.description,
      completed: row.completed,
      completedAt: row.completed_at,
      notes: row.notes,
      createdAt: row.created_at,
    };
  },

  mapServiceOrderCollaborator(row: any): ServiceOrderCollaborator {
    return {
      id: row.id,
      serviceOrderId: row.service_order_id,
      collaboratorId: row.collaborator_id,
      hoursWorked: row.hours_worked,
      commissionAmount: row.commission_amount,
      notes: row.notes,
      createdAt: row.created_at,
    };
  },

  camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  },
};
