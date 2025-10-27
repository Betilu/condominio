import api from './axios';

// Authentication Services
export const authService = {
  login: (credentials) => api.post('/auth/token/', credentials),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// User Management Services
export const userService = {
  getUsers: (params) => api.get('/users/', { params }),
  getUser: (id) => api.get(`/users/${id}/`),
  getCurrentUser: () => api.get('/me/'),
  createUser: (data) => api.post('/users/', data),
  updateUser: (id, data) => api.put(`/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/users/${id}/`),
  assignRole: (data) => api.post('/roles/assign/', data),
  unassignRole: (data) => api.post('/roles/unassign/', data),
  getRoles: () => api.get('/roles/'),
  getUserRoles: () => api.get('/user-roles/'),
  createRole: (data) => api.post('/user-roles/', data),
  updateRole: (id, data) => api.put(`/user-roles/${id}/`, data),
  deleteRole: (id) => api.delete(`/user-roles/${id}/`),
  getPermissions: () => api.get('/permissions/'),
  getUserPermissions: (id) => api.get(`/users/${id}/permissions/`),
  changePassword: (id, data) => api.post(`/users/${id}/change-password/`, data)
};

// Units Management Services
export const unitsService = {
  // Towers
  getTowers: (params) => api.get('/towers/', { params }),
  getTower: (id) => api.get(`/towers/${id}/`),
  createTower: (data) => api.post('/towers/', data),
  updateTower: (id, data) => api.put(`/towers/${id}/`, data),
  deleteTower: (id) => api.delete(`/towers/${id}/`),
  
  // Blocks
  getBlocks: (params) => api.get('/blocks/', { params }),
  getBlock: (id) => api.get(`/blocks/${id}/`),
  createBlock: (data) => api.post('/blocks/', data),
  updateBlock: (id, data) => api.put(`/blocks/${id}/`, data),
  deleteBlock: (id) => api.delete(`/blocks/${id}/`),
  
  // Units
  getUnits: (params) => api.get('/units/', { params }),
  getUnit: (id) => api.get(`/units/${id}/`),
  createUnit: (data) => api.post('/units/', data),
  updateUnit: (id, data) => api.put(`/units/${id}/`, data),
  deleteUnit: (id) => api.delete(`/units/${id}/`),
  
  // Unit Memberships
  getUnitMemberships: (params) => api.get('/unit-memberships/', { params }),
  getUnitMembership: (id) => api.get(`/unit-memberships/${id}/`),
  createUnitMembership: (data) => api.post('/unit-memberships/', data),
  updateUnitMembership: (id, data) => api.put(`/unit-memberships/${id}/`, data),
  deleteUnitMembership: (id) => api.delete(`/unit-memberships/${id}/`)
};

// Finance Services
export const financeService = {
  // Fee Configs
  getFeeConfigs: (params) => api.get('/fee-configs/', { params }),
  getFeeConfig: (id) => api.get(`/fee-configs/${id}/`),
  createFeeConfig: (data) => api.post('/fee-configs/', data),
  updateFeeConfig: (id, data) => api.put(`/fee-configs/${id}/`, data),
  deleteFeeConfig: (id) => api.delete(`/fee-configs/${id}/`),
  
  // Fee Concepts
  getFeeConcepts: (params) => api.get('/fee-concepts/', { params }),
  getFeeConcept: (id) => api.get(`/fee-concepts/${id}/`),
  createFeeConcept: (data) => api.post('/fee-concepts/', data),
  updateFeeConcept: (id, data) => api.put(`/fee-concepts/${id}/`, data),
  deleteFeeConcept: (id) => api.delete(`/fee-concepts/${id}/`),
  
  // Billing Periods
  getBillingPeriods: (params) => api.get('/billing-periods/', { params }),
  getBillingPeriod: (id) => api.get(`/billing-periods/${id}/`),
  createBillingPeriod: (data) => api.post('/billing-periods/', data),
  updateBillingPeriod: (id, data) => api.put(`/billing-periods/${id}/`, data),
  deleteBillingPeriod: (id) => api.delete(`/billing-periods/${id}/`),
  
  // Unit Charges
  getUnitCharges: (params) => api.get('/unit-charges/', { params }),
  getUnitCharge: (id) => api.get(`/unit-charges/${id}/`),
  createUnitCharge: (data) => api.post('/unit-charges/', data),
  updateUnitCharge: (id, data) => api.put(`/unit-charges/${id}/`, data),
  deleteUnitCharge: (id) => api.delete(`/unit-charges/${id}/`),
  generateCharges: (data) => api.post('/unit-charges/generate_charges/', data),
  applyInterest: (id) => api.post(`/unit-charges/${id}/apply_interest/`),
  
  // Interest Rates
  getInterestRates: (params) => api.get('/interest-rates/', { params }),
  getInterestRate: (id) => api.get(`/interest-rates/${id}/`),
  createInterestRate: (data) => api.post('/interest-rates/', data),
  updateInterestRate: (id, data) => api.put(`/interest-rates/${id}/`, data),
  deleteInterestRate: (id) => api.delete(`/interest-rates/${id}/`),
  
  // Credit Notes
  getCreditNotes: (params) => api.get('/credit-notes/', { params }),
  getCreditNote: (id) => api.get(`/credit-notes/${id}/`),
  createCreditNote: (data) => api.post('/credit-notes/', data),
  updateCreditNote: (id, data) => api.put(`/credit-notes/${id}/`, data),
  deleteCreditNote: (id) => api.delete(`/credit-notes/${id}/`),
  
  // Fines
  getFines: (params) => api.get('/fines/', { params }),
  getFine: (id) => api.get(`/fines/${id}/`),
  createFine: (data) => api.post('/fines/', data),
  updateFine: (id, data) => api.put(`/fines/${id}/`, data),
  deleteFine: (id) => api.delete(`/fines/${id}/`),
  
  // Payments
  getPayments: (params) => api.get('/payments/', { params }),
  getPayment: (id) => api.get(`/payments/${id}/`),
  createPayment: (data) => api.post('/payments/', data),
  updatePayment: (id, data) => api.put(`/payments/${id}/`, data),
  deletePayment: (id) => api.delete(`/payments/${id}/`),
  getDailySummary: (params) => api.get('/payments/daily_summary/', { params }),
  
  // Legacy charges (for backward compatibility)
  getCharges: (params) => api.get('/unit-charges/', { params }),
  getCharge: (id) => api.get(`/unit-charges/${id}/`),
  createCharge: (data) => api.post('/unit-charges/', data),
  updateCharge: (id, data) => api.put(`/unit-charges/${id}/`, data),
  deleteCharge: (id) => api.delete(`/unit-charges/${id}/`)
};

// Amenities Services
export const amenitiesService = {
  // Amenities
  getAmenities: (params) => api.get('/amenities/', { params }),
  getAmenity: (id) => api.get(`/amenities/${id}/`),
  createAmenity: (data) => api.post('/amenities/', data),
  updateAmenity: (id, data) => api.put(`/amenities/${id}/`, data),
  deleteAmenity: (id) => api.delete(`/amenities/${id}/`),
  
  // Amenity Schedules
  getAmenitySchedules: (params) => api.get('/amenity-schedules/', { params }),
  getAmenitySchedule: (id) => api.get(`/amenity-schedules/${id}/`),
  createAmenitySchedule: (data) => api.post('/amenity-schedules/', data),
  updateAmenitySchedule: (id, data) => api.put(`/amenity-schedules/${id}/`, data),
  deleteAmenitySchedule: (id) => api.delete(`/amenity-schedules/${id}/`),
  
  // Amenity Rates
  getAmenityRates: (params) => api.get('/amenity-rates/', { params }),
  getAmenityRate: (id) => api.get(`/amenity-rates/${id}/`),
  createAmenityRate: (data) => api.post('/amenity-rates/', data),
  updateAmenityRate: (id, data) => api.put(`/amenity-rates/${id}/`, data),
  deleteAmenityRate: (id) => api.delete(`/amenity-rates/${id}/`),
  
  // Amenity Reservations
  getAmenityReservations: (params) => api.get('/amenity-reservations/', { params }),
  getAmenityReservation: (id) => api.get(`/amenity-reservations/${id}/`),
  createAmenityReservation: (data) => api.post('/amenity-reservations/', data),
  updateAmenityReservation: (id, data) => api.put(`/amenity-reservations/${id}/`, data),
  deleteAmenityReservation: (id) => api.delete(`/amenity-reservations/${id}/`),
  
  // Amenity Blackouts
  getAmenityBlackouts: (params) => api.get('/amenity-blackouts/', { params }),
  getAmenityBlackout: (id) => api.get(`/amenity-blackouts/${id}/`),
  createAmenityBlackout: (data) => api.post('/amenity-blackouts/', data),
  updateAmenityBlackout: (id, data) => api.put(`/amenity-blackouts/${id}/`, data),
  deleteAmenityBlackout: (id) => api.delete(`/amenity-blackouts/${id}/`),
  
  // Amenity Usage
  getAmenityUsage: (params) => api.get('/amenity-usage/', { params }),
  getAmenityUsageItem: (id) => api.get(`/amenity-usage/${id}/`),
  createAmenityUsage: (data) => api.post('/amenity-usage/', data),
  updateAmenityUsage: (id, data) => api.put(`/amenity-usage/${id}/`, data),
  deleteAmenityUsage: (id) => api.delete(`/amenity-usage/${id}/`),
  
  // Legacy reservations (for backward compatibility)
  getReservations: (params) => api.get('/amenity-reservations/', { params }),
  getReservation: (id) => api.get(`/amenity-reservations/${id}/`),
  createReservation: (data) => api.post('/amenity-reservations/', data),
  updateReservation: (id, data) => api.put(`/amenity-reservations/${id}/`, data),
  deleteReservation: (id) => api.delete(`/amenity-reservations/${id}/`)
};

// Maintenance Services
export const maintenanceService = {
  // Assets
  getAssets: (params) => api.get('/assets/', { params }),
  getAsset: (id) => api.get(`/assets/${id}/`),
  createAsset: (data) => api.post('/assets/', data),
  updateAsset: (id, data) => api.put(`/assets/${id}/`, data),
  deleteAsset: (id) => api.delete(`/assets/${id}/`),
  
  // Preventive Plans
  getPreventivePlans: (params) => api.get('/preventive-plans/', { params }),
  getPreventivePlan: (id) => api.get(`/preventive-plans/${id}/`),
  createPreventivePlan: (data) => api.post('/preventive-plans/', data),
  updatePreventivePlan: (id, data) => api.put(`/preventive-plans/${id}/`, data),
  deletePreventivePlan: (id) => api.delete(`/preventive-plans/${id}/`),
  
  // Preventive Tasks
  getPreventiveTasks: (params) => api.get('/preventive-tasks/', { params }),
  getPreventiveTask: (id) => api.get(`/preventive-tasks/${id}/`),
  createPreventiveTask: (data) => api.post('/preventive-tasks/', data),
  updatePreventiveTask: (id, data) => api.put(`/preventive-tasks/${id}/`, data),
  deletePreventiveTask: (id) => api.delete(`/preventive-tasks/${id}/`),
  
  // Work Orders
  getWorkOrders: (params) => api.get('/work-orders/', { params }),
  getWorkOrder: (id) => api.get(`/work-orders/${id}/`),
  createWorkOrder: (data) => api.post('/work-orders/', data),
  updateWorkOrder: (id, data) => api.put(`/work-orders/${id}/`, data),
  deleteWorkOrder: (id) => api.delete(`/work-orders/${id}/`),
  
  // Work Order Tasks
  getWorkOrderTasks: (params) => api.get('/work-order-tasks/', { params }),
  getWorkOrderTask: (id) => api.get(`/work-order-tasks/${id}/`),
  createWorkOrderTask: (data) => api.post('/work-order-tasks/', data),
  updateWorkOrderTask: (id, data) => api.put(`/work-order-tasks/${id}/`, data),
  deleteWorkOrderTask: (id) => api.delete(`/work-order-tasks/${id}/`),
  
  // Suppliers
  getSuppliers: (params) => api.get('/suppliers/', { params }),
  getSupplier: (id) => api.get(`/suppliers/${id}/`),
  createSupplier: (data) => api.post('/suppliers/', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}/`, data),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}/`),
  
  // Work Order Costs
  getWorkOrderCosts: (params) => api.get('/work-order-costs/', { params }),
  getWorkOrderCost: (id) => api.get(`/work-order-costs/${id}/`),
  createWorkOrderCost: (data) => api.post('/work-order-costs/', data),
  updateWorkOrderCost: (id, data) => api.put(`/work-order-costs/${id}/`, data),
  deleteWorkOrderCost: (id) => api.delete(`/work-order-costs/${id}/`),
  
  // Work Order Attachments
  getWorkOrderAttachments: (params) => api.get('/work-order-attachments/', { params }),
  getWorkOrderAttachment: (id) => api.get(`/work-order-attachments/${id}/`),
  createWorkOrderAttachment: (data) => api.post('/work-order-attachments/', data),
  updateWorkOrderAttachment: (id, data) => api.put(`/work-order-attachments/${id}/`, data),
  deleteWorkOrderAttachment: (id) => api.delete(`/work-order-attachments/${id}/`),
  
  // Legacy providers (for backward compatibility)
  getProviders: (params) => api.get('/suppliers/', { params }),
  getProvider: (id) => api.get(`/suppliers/${id}/`),
  createProvider: (data) => api.post('/suppliers/', data),
  updateProvider: (id, data) => api.put(`/suppliers/${id}/`, data),
  deleteProvider: (id) => api.delete(`/suppliers/${id}/`)
};

// Security Services
export const securityService = {
  // Visitors
  getVisitors: (params) => api.get('/visitors/', { params }),
  getVisitor: (id) => api.get(`/visitors/${id}/`),
  createVisitor: (data) => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': undefined, // Let axios set it automatically for FormData
      },
    } : {};
    return api.post('/visitors/', data, config);
  },
  updateVisitor: (id, data) => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': undefined, // Let axios set it automatically for FormData
      },
    } : {};
    return api.put(`/visitors/${id}/`, data, config);
  },
  deleteVisitor: (id) => api.delete(`/visitors/${id}/`),
  
  // Access Authorizations
  getAccessAuthorizations: (params) => api.get('/access-authorizations/', { params }),
  getAccessAuthorization: (id) => api.get(`/access-authorizations/${id}/`),
  createAccessAuthorization: (data) => api.post('/access-authorizations/', data),
  updateAccessAuthorization: (id, data) => api.put(`/access-authorizations/${id}/`, data),
  deleteAccessAuthorization: (id) => api.delete(`/access-authorizations/${id}/`),
  
  // Access Events
  getAccessEvents: (params) => api.get('/access-events/', { params }),
  getAccessEvent: (id) => api.get(`/access-events/${id}/`),
  createAccessEvent: (data) => api.post('/access-events/', data),
  updateAccessEvent: (id, data) => api.put(`/access-events/${id}/`, data),
  deleteAccessEvent: (id) => api.delete(`/access-events/${id}/`),
  
  // Security Guards
  getSecurityGuards: (params) => api.get('/security-guards/', { params }),
  getSecurityGuard: (id) => api.get(`/security-guards/${id}/`),
  createSecurityGuard: (data) => api.post('/security-guards/', data),
  updateSecurityGuard: (id, data) => api.put(`/security-guards/${id}/`, data),
  deleteSecurityGuard: (id) => api.delete(`/security-guards/${id}/`),
  
  // Security Incidents
  getSecurityIncidents: (params) => api.get('/security-incidents/', { params }),
  getSecurityIncident: (id) => api.get(`/security-incidents/${id}/`),
  createSecurityIncident: (data) => api.post('/security-incidents/', data),
  updateSecurityIncident: (id, data) => api.put(`/security-incidents/${id}/`, data),
  deleteSecurityIncident: (id) => api.delete(`/security-incidents/${id}/`),
  
  // Face Recognition
  getFaceEncodings: (params) => api.get('/face-encodings/', { params }),
  getFaceEncoding: (id) => api.get(`/face-encodings/${id}/`),
  createFaceEncoding: (data) => api.post('/face-encodings/', data),
  updateFaceEncoding: (id, data) => api.put(`/face-encodings/${id}/`, data),
  deleteFaceEncoding: (id) => api.delete(`/face-encodings/${id}/`),
  registerFace: (data) => api.post('/face-encodings/register_face/', data),
  recognizeVisitor: (data) => api.post('/face-encodings/recognize_visitor/', data),
  
  // Attendance
  getAttendance: (params) => api.get('/attendance/', { params }),
  getAttendanceRecord: (id) => api.get(`/attendance/${id}/`),
  createAttendance: (data) => api.post('/attendance/', data),
  updateAttendance: (id, data) => api.put(`/attendance/${id}/`, data),
  deleteAttendance: (id) => api.delete(`/attendance/${id}/`),
  recordAttendance: (data) => api.post('/attendance/record_attendance/', data),
  getTodayAttendance: () => api.get('/attendance/today_attendance/'),
  
  // Legacy faces (for backward compatibility)
  getFaces: (params) => api.get('/visitors/', { params }),
  getFace: (id) => api.get(`/visitors/${id}/`),
  createFace: (data) => api.post('/visitors/', data),
  updateFace: (id, data) => api.put(`/visitors/${id}/`, data),
  deleteFace: (id) => api.delete(`/visitors/${id}/`),
  
  // Legacy access logs (for backward compatibility)
  getAccessLogs: (params) => api.get('/access-events/', { params }),
  getAccessLog: (id) => api.get(`/access-events/${id}/`),
  createAccessLog: (data) => api.post('/access-events/', data),
  updateAccessLog: (id, data) => api.put(`/access-events/${id}/`, data),
  deleteAccessLog: (id) => api.delete(`/access-events/${id}/`)
};

// Notices Services
export const noticesService = {
  getNotices: (params) => api.get('/notices/', { params }),
  getNotice: (id) => api.get(`/notices/${id}/`),
  createNotice: (data) => api.post('/notices/', data),
  updateNotice: (id, data) => api.put(`/notices/${id}/`, data),
  deleteNotice: (id) => api.delete(`/notices/${id}/`)
};




// Reports Services
export const reportsService = {
  // Dashboard KPIs
  getDashboardKPIs: () => api.get('/reports/dashboard_kpis/'),

  // ========== REPORTES PRINCIPALES ==========
  // Financial Reports
  getAgingDebt: (params) => api.get('/reports/aging_debt/', { params }),
  getCollectionRate: (params) => api.get('/reports/collection_rate/', { params }),

  // Security Reports
  getAccessStatistics: (params) => api.get('/reports/access_statistics/', { params }),

  // Amenities Reports
  getAmenitiesUsage: (params) => api.get('/reports/amenities_usage/', { params }),

  // Maintenance Reports
  getMaintenanceSummary: (params) => api.get('/reports/maintenance_summary/', { params }),

  // ========== REPORTES AVANZADOS ==========
  getAdvancedFinancialAnalysis: (params) => api.get('/reports/advanced_financial_analysis/', { params }),
  getSecurityDetailedReport: (params) => api.get('/reports/security_detailed_report/', { params }),
  getAmenitiesUtilizationAnalysis: (params) => api.get('/reports/amenities_utilization_analysis/', { params }),

  // ========== REPORTES DE ACCESO RÁPIDO ==========
  getQuickFinancialSnapshot: () => api.get('/reports/quick_financial_snapshot/'),
  getQuickSecuritySnapshot: () => api.get('/reports/quick_security_snapshot/'),
  getQuickMaintenanceSnapshot: () => api.get('/reports/quick_maintenance_snapshot/'),
  getQuickAmenitiesSnapshot: () => api.get('/reports/quick_amenities_snapshot/'),

  // Export Reports - Retorna datos JSON para que el frontend haga el Excel
  exportReport: (params) => {
    return api.get('/reports/export_report/', {
      params: {
        report_type: params.report_type,
        start_date: params.start_date,
        end_date: params.end_date
      }
    });
  },

  // Legacy reports (for backward compatibility)
  getFinanceMorosity: (params) => api.get('/reports/aging_debt/', { params }),
  getAccessTrends: (params) => api.get('/reports/access_statistics/', { params })
};

// Dashboard Services
export const dashboardService = {
  getStats: async () => {
    try {
      const [users, units, payments, notices] = await Promise.all([
        userService.getUsers({ page_size: 1 }),
        unitsService.getUnits({ page_size: 1 }),
        financeService.getPayments({ page_size: 1 }),
        noticesService.getNotices({ page_size: 1 })
      ]);
      
      return {
        totalUsers: users.data.count,
        totalUnits: units.data.count,
        totalPayments: payments.data.count,
        totalNotices: notices.data.count
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { totalUsers: 0, totalUnits: 0, totalPayments: 0, totalNotices: 0 };
    }
  }
};
