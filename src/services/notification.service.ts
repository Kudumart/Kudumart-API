import AdminNotification from '../models/adminnotification';

export async function createAdminNotification(type: string, message: string, data?: object) {
  try {
    await AdminNotification.create({
      type,
      message,
      data: data || null,
      read: false,
    });
  } catch (error) {
    // Log error but do not break main flow
    // eslint-disable-next-line no-console
    console.error('Failed to create admin notification:', error);
  }
} 