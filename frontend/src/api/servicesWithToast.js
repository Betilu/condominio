import { toast } from 'react-hot-toast';
import * as services from './services';

// Helper function to wrap API calls with toast notifications
const withToast = (serviceFunction, successMessage, errorMessage) => {
  return async (...args) => {
    const toastId = toast.loading('Procesando...');
    try {
      const result = await serviceFunction(...args);
      toast.dismiss(toastId);
      toast.success(successMessage);
      return result;
    } catch (error) {
      toast.dismiss(toastId);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || errorMessage;
      toast.error(errorMsg);
      throw error;
    }
  };
};

// User Management Services with Toast
export const userService = {
  getUsers: services.userService.getUsers,
  getUser: services.userService.getUser,
  createUser: withToast(services.userService.createUser, 'Usuario creado exitosamente', 'Error al crear usuario'),
  updateUser: withToast(services.userService.updateUser, 'Usuario actualizado exitosamente', 'Error al actualizar usuario'),
  deleteUser: withToast(services.userService.deleteUser, 'Usuario eliminado exitosamente', 'Error al eliminar usuario'),
  assignRole: withToast(services.userService.assignRole, 'Rol asignado exitosamente', 'Error al asignar rol'),
  unassignRole: withToast(services.userService.unassignRole, 'Rol removido exitosamente', 'Error al remover rol'),
  getRoles: services.userService.getRoles,
  getUserRoles: services.userService.getUserRoles,
  createRole: withToast(services.userService.createRole, 'Rol creado exitosamente', 'Error al crear rol'),
  updateRole: withToast(services.userService.updateRole, 'Rol actualizado exitosamente', 'Error al actualizar rol'),
  deleteRole: withToast(services.userService.deleteRole, 'Rol eliminado exitosamente', 'Error al eliminar rol'),
  getPermissions: services.userService.getPermissions,
  changePassword: withToast(services.userService.changePassword, 'Contraseña actualizada exitosamente', 'Error al cambiar contraseña')
};

// Accounts Service (alias for userService for backward compatibility)
export const accountsService = userService;

// Units Management Services with Toast
export const unitsService = {
  // Towers
  getTowers: services.unitsService.getTowers,
  getTower: services.unitsService.getTower,
  createTower: withToast(services.unitsService.createTower, 'Torre creada exitosamente', 'Error al crear torre'),
  updateTower: withToast(services.unitsService.updateTower, 'Torre actualizada exitosamente', 'Error al actualizar torre'),
  deleteTower: withToast(services.unitsService.deleteTower, 'Torre eliminada exitosamente', 'Error al eliminar torre'),
  
  // Blocks
  getBlocks: services.unitsService.getBlocks,
  getBlock: services.unitsService.getBlock,
  createBlock: withToast(services.unitsService.createBlock, 'Bloque creado exitosamente', 'Error al crear bloque'),
  updateBlock: withToast(services.unitsService.updateBlock, 'Bloque actualizado exitosamente', 'Error al actualizar bloque'),
  deleteBlock: withToast(services.unitsService.deleteBlock, 'Bloque eliminado exitosamente', 'Error al eliminar bloque'),
  
  // Units
  getUnits: services.unitsService.getUnits,
  getUnit: services.unitsService.getUnit,
  createUnit: withToast(services.unitsService.createUnit, 'Unidad creada exitosamente', 'Error al crear unidad'),
  updateUnit: withToast(services.unitsService.updateUnit, 'Unidad actualizada exitosamente', 'Error al actualizar unidad'),
  deleteUnit: withToast(services.unitsService.deleteUnit, 'Unidad eliminada exitosamente', 'Error al eliminar unidad'),
  
  // Unit Memberships
  getUnitMemberships: services.unitsService.getUnitMemberships,
  getUnitMembership: services.unitsService.getUnitMembership,
  createUnitMembership: withToast(services.unitsService.createUnitMembership, 'Membresía creada exitosamente', 'Error al crear membresía'),
  updateUnitMembership: withToast(services.unitsService.updateUnitMembership, 'Membresía actualizada exitosamente', 'Error al actualizar membresía'),
  deleteUnitMembership: withToast(services.unitsService.deleteUnitMembership, 'Membresía eliminada exitosamente', 'Error al eliminar membresía')
};

// Finance Services with Toast
export const financeService = {
  // Fee Concepts
  getFeeConcepts: services.financeService.getFeeConcepts,
  getFeeConcept: services.financeService.getFeeConcept,
  createFeeConcept: withToast(services.financeService.createFeeConcept, 'Concepto de cuota creado exitosamente', 'Error al crear concepto de cuota'),
  updateFeeConcept: withToast(services.financeService.updateFeeConcept, 'Concepto de cuota actualizado exitosamente', 'Error al actualizar concepto de cuota'),
  deleteFeeConcept: withToast(services.financeService.deleteFeeConcept, 'Concepto de cuota eliminado exitosamente', 'Error al eliminar concepto de cuota'),
  
  // Billing Periods
  getBillingPeriods: services.financeService.getBillingPeriods,
  getBillingPeriod: services.financeService.getBillingPeriod,
  createBillingPeriod: withToast(services.financeService.createBillingPeriod, 'Período de facturación creado exitosamente', 'Error al crear período de facturación'),
  updateBillingPeriod: withToast(services.financeService.updateBillingPeriod, 'Período de facturación actualizado exitosamente', 'Error al actualizar período de facturación'),
  deleteBillingPeriod: withToast(services.financeService.deleteBillingPeriod, 'Período de facturación eliminado exitosamente', 'Error al eliminar período de facturación'),
  
  // Unit Charges
  getUnitCharges: services.financeService.getUnitCharges,
  getUnitCharge: services.financeService.getUnitCharge,
  createUnitCharge: withToast(services.financeService.createUnitCharge, 'Cargo de unidad creado exitosamente', 'Error al crear cargo de unidad'),
  updateUnitCharge: withToast(services.financeService.updateUnitCharge, 'Cargo de unidad actualizado exitosamente', 'Error al actualizar cargo de unidad'),
  deleteUnitCharge: withToast(services.financeService.deleteUnitCharge, 'Cargo de unidad eliminado exitosamente', 'Error al eliminar cargo de unidad'),
  generateCharges: withToast(services.financeService.generateCharges, 'Cargos generados exitosamente', 'Error al generar cargos'),
  applyInterest: withToast(services.financeService.applyInterest, 'Interés aplicado exitosamente', 'Error al aplicar interés'),
  
  // Interest Rates
  getInterestRates: services.financeService.getInterestRates,
  getInterestRate: services.financeService.getInterestRate,
  createInterestRate: withToast(services.financeService.createInterestRate, 'Tasa de interés creada exitosamente', 'Error al crear tasa de interés'),
  updateInterestRate: withToast(services.financeService.updateInterestRate, 'Tasa de interés actualizada exitosamente', 'Error al actualizar tasa de interés'),
  deleteInterestRate: withToast(services.financeService.deleteInterestRate, 'Tasa de interés eliminada exitosamente', 'Error al eliminar tasa de interés'),
  
  // Credit Notes
  getCreditNotes: services.financeService.getCreditNotes,
  getCreditNote: services.financeService.getCreditNote,
  createCreditNote: withToast(services.financeService.createCreditNote, 'Nota de crédito creada exitosamente', 'Error al crear nota de crédito'),
  updateCreditNote: withToast(services.financeService.updateCreditNote, 'Nota de crédito actualizada exitosamente', 'Error al actualizar nota de crédito'),
  deleteCreditNote: withToast(services.financeService.deleteCreditNote, 'Nota de crédito eliminada exitosamente', 'Error al eliminar nota de crédito'),
  
  // Fines
  getFines: services.financeService.getFines,
  getFine: services.financeService.getFine,
  createFine: withToast(services.financeService.createFine, 'Multa creada exitosamente', 'Error al crear multa'),
  updateFine: withToast(services.financeService.updateFine, 'Multa actualizada exitosamente', 'Error al actualizar multa'),
  deleteFine: withToast(services.financeService.deleteFine, 'Multa eliminada exitosamente', 'Error al eliminar multa'),
  
  // Payments
  getPayments: services.financeService.getPayments,
  getPayment: services.financeService.getPayment,
  createPayment: withToast(services.financeService.createPayment, 'Pago registrado exitosamente', 'Error al registrar pago'),
  updatePayment: withToast(services.financeService.updatePayment, 'Pago actualizado exitosamente', 'Error al actualizar pago'),
  deletePayment: withToast(services.financeService.deletePayment, 'Pago eliminado exitosamente', 'Error al eliminar pago'),
  getDailySummary: services.financeService.getDailySummary,
  
  // Legacy charges (for backward compatibility)
  getCharges: services.financeService.getCharges,
  getCharge: services.financeService.getCharge,
  createCharge: withToast(services.financeService.createCharge, 'Cargo creado exitosamente', 'Error al crear cargo'),
  updateCharge: withToast(services.financeService.updateCharge, 'Cargo actualizado exitosamente', 'Error al actualizar cargo'),
  deleteCharge: withToast(services.financeService.deleteCharge, 'Cargo eliminado exitosamente', 'Error al eliminar cargo')
};

// Amenities Services with Toast
export const amenitiesService = {
  // Amenities
  getAmenities: services.amenitiesService.getAmenities,
  getAmenity: services.amenitiesService.getAmenity,
  createAmenity: withToast(services.amenitiesService.createAmenity, 'Amenidad creada exitosamente', 'Error al crear amenidad'),
  updateAmenity: withToast(services.amenitiesService.updateAmenity, 'Amenidad actualizada exitosamente', 'Error al actualizar amenidad'),
  deleteAmenity: withToast(services.amenitiesService.deleteAmenity, 'Amenidad eliminada exitosamente', 'Error al eliminar amenidad'),
  
  // Amenity Schedules
  getAmenitySchedules: services.amenitiesService.getAmenitySchedules,
  getAmenitySchedule: services.amenitiesService.getAmenitySchedule,
  createAmenitySchedule: withToast(services.amenitiesService.createAmenitySchedule, 'Horario creado exitosamente', 'Error al crear horario'),
  updateAmenitySchedule: withToast(services.amenitiesService.updateAmenitySchedule, 'Horario actualizado exitosamente', 'Error al actualizar horario'),
  deleteAmenitySchedule: withToast(services.amenitiesService.deleteAmenitySchedule, 'Horario eliminado exitosamente', 'Error al eliminar horario'),
  
  // Amenity Rates
  getAmenityRates: services.amenitiesService.getAmenityRates,
  getAmenityRate: services.amenitiesService.getAmenityRate,
  createAmenityRate: withToast(services.amenitiesService.createAmenityRate, 'Tarifa creada exitosamente', 'Error al crear tarifa'),
  updateAmenityRate: withToast(services.amenitiesService.updateAmenityRate, 'Tarifa actualizada exitosamente', 'Error al actualizar tarifa'),
  deleteAmenityRate: withToast(services.amenitiesService.deleteAmenityRate, 'Tarifa eliminada exitosamente', 'Error al eliminar tarifa'),
  
  // Amenity Reservations
  getAmenityReservations: services.amenitiesService.getAmenityReservations,
  getAmenityReservation: services.amenitiesService.getAmenityReservation,
  createAmenityReservation: withToast(services.amenitiesService.createAmenityReservation, 'Reserva creada exitosamente', 'Error al crear reserva'),
  updateAmenityReservation: withToast(services.amenitiesService.updateAmenityReservation, 'Reserva actualizada exitosamente', 'Error al actualizar reserva'),
  deleteAmenityReservation: withToast(services.amenitiesService.deleteAmenityReservation, 'Reserva eliminada exitosamente', 'Error al eliminar reserva'),
  
  // Amenity Blackouts
  getAmenityBlackouts: services.amenitiesService.getAmenityBlackouts,
  getAmenityBlackout: services.amenitiesService.getAmenityBlackout,
  createAmenityBlackout: withToast(services.amenitiesService.createAmenityBlackout, 'Fecha bloqueada creada exitosamente', 'Error al crear fecha bloqueada'),
  updateAmenityBlackout: withToast(services.amenitiesService.updateAmenityBlackout, 'Fecha bloqueada actualizada exitosamente', 'Error al actualizar fecha bloqueada'),
  deleteAmenityBlackout: withToast(services.amenitiesService.deleteAmenityBlackout, 'Fecha bloqueada eliminada exitosamente', 'Error al eliminar fecha bloqueada'),
  
  // Amenity Usage
  getAmenityUsage: services.amenitiesService.getAmenityUsage,
  getAmenityUsageItem: services.amenitiesService.getAmenityUsageItem,
  createAmenityUsage: withToast(services.amenitiesService.createAmenityUsage, 'Uso registrado exitosamente', 'Error al registrar uso'),
  updateAmenityUsage: withToast(services.amenitiesService.updateAmenityUsage, 'Uso actualizado exitosamente', 'Error al actualizar uso'),
  deleteAmenityUsage: withToast(services.amenitiesService.deleteAmenityUsage, 'Uso eliminado exitosamente', 'Error al eliminar uso'),
  
  // Legacy reservations (for backward compatibility)
  getReservations: services.amenitiesService.getReservations,
  getReservation: services.amenitiesService.getReservation,
  createReservation: withToast(services.amenitiesService.createReservation, 'Reserva creada exitosamente', 'Error al crear reserva'),
  updateReservation: withToast(services.amenitiesService.updateReservation, 'Reserva actualizada exitosamente', 'Error al actualizar reserva'),
  deleteReservation: withToast(services.amenitiesService.deleteReservation, 'Reserva eliminada exitosamente', 'Error al eliminar reserva')
};

// Maintenance Services with Toast
export const maintenanceService = {
  // Assets
  getAssets: services.maintenanceService.getAssets,
  getAsset: services.maintenanceService.getAsset,
  createAsset: withToast(services.maintenanceService.createAsset, 'Activo creado exitosamente', 'Error al crear activo'),
  updateAsset: withToast(services.maintenanceService.updateAsset, 'Activo actualizado exitosamente', 'Error al actualizar activo'),
  deleteAsset: withToast(services.maintenanceService.deleteAsset, 'Activo eliminado exitosamente', 'Error al eliminar activo'),
  
  // Preventive Plans
  getPreventivePlans: services.maintenanceService.getPreventivePlans,
  getPreventivePlan: services.maintenanceService.getPreventivePlan,
  createPreventivePlan: withToast(services.maintenanceService.createPreventivePlan, 'Plan preventivo creado exitosamente', 'Error al crear plan preventivo'),
  updatePreventivePlan: withToast(services.maintenanceService.updatePreventivePlan, 'Plan preventivo actualizado exitosamente', 'Error al actualizar plan preventivo'),
  deletePreventivePlan: withToast(services.maintenanceService.deletePreventivePlan, 'Plan preventivo eliminado exitosamente', 'Error al eliminar plan preventivo'),
  
  // Preventive Tasks
  getPreventiveTasks: services.maintenanceService.getPreventiveTasks,
  getPreventiveTask: services.maintenanceService.getPreventiveTask,
  createPreventiveTask: withToast(services.maintenanceService.createPreventiveTask, 'Tarea preventiva creada exitosamente', 'Error al crear tarea preventiva'),
  updatePreventiveTask: withToast(services.maintenanceService.updatePreventiveTask, 'Tarea preventiva actualizada exitosamente', 'Error al actualizar tarea preventiva'),
  deletePreventiveTask: withToast(services.maintenanceService.deletePreventiveTask, 'Tarea preventiva eliminada exitosamente', 'Error al eliminar tarea preventiva'),
  
  // Work Orders
  getWorkOrders: services.maintenanceService.getWorkOrders,
  getWorkOrder: services.maintenanceService.getWorkOrder,
  createWorkOrder: withToast(services.maintenanceService.createWorkOrder, 'Orden de trabajo creada exitosamente', 'Error al crear orden de trabajo'),
  updateWorkOrder: withToast(services.maintenanceService.updateWorkOrder, 'Orden de trabajo actualizada exitosamente', 'Error al actualizar orden de trabajo'),
  deleteWorkOrder: withToast(services.maintenanceService.deleteWorkOrder, 'Orden de trabajo eliminada exitosamente', 'Error al eliminar orden de trabajo'),
  
  // Work Order Tasks
  getWorkOrderTasks: services.maintenanceService.getWorkOrderTasks,
  getWorkOrderTask: services.maintenanceService.getWorkOrderTask,
  createWorkOrderTask: withToast(services.maintenanceService.createWorkOrderTask, 'Tarea de orden creada exitosamente', 'Error al crear tarea de orden'),
  updateWorkOrderTask: withToast(services.maintenanceService.updateWorkOrderTask, 'Tarea de orden actualizada exitosamente', 'Error al actualizar tarea de orden'),
  deleteWorkOrderTask: withToast(services.maintenanceService.deleteWorkOrderTask, 'Tarea de orden eliminada exitosamente', 'Error al eliminar tarea de orden'),
  
  // Suppliers
  getSuppliers: services.maintenanceService.getSuppliers,
  getSupplier: services.maintenanceService.getSupplier,
  createSupplier: withToast(services.maintenanceService.createSupplier, 'Proveedor creado exitosamente', 'Error al crear proveedor'),
  updateSupplier: withToast(services.maintenanceService.updateSupplier, 'Proveedor actualizado exitosamente', 'Error al actualizar proveedor'),
  deleteSupplier: withToast(services.maintenanceService.deleteSupplier, 'Proveedor eliminado exitosamente', 'Error al eliminar proveedor'),
  
  // Work Order Costs
  getWorkOrderCosts: services.maintenanceService.getWorkOrderCosts,
  getWorkOrderCost: services.maintenanceService.getWorkOrderCost,
  createWorkOrderCost: withToast(services.maintenanceService.createWorkOrderCost, 'Costo creado exitosamente', 'Error al crear costo'),
  updateWorkOrderCost: withToast(services.maintenanceService.updateWorkOrderCost, 'Costo actualizado exitosamente', 'Error al actualizar costo'),
  deleteWorkOrderCost: withToast(services.maintenanceService.deleteWorkOrderCost, 'Costo eliminado exitosamente', 'Error al eliminar costo'),
  
  // Work Order Attachments
  getWorkOrderAttachments: services.maintenanceService.getWorkOrderAttachments,
  getWorkOrderAttachment: services.maintenanceService.getWorkOrderAttachment,
  createWorkOrderAttachment: withToast(services.maintenanceService.createWorkOrderAttachment, 'Adjunto creado exitosamente', 'Error al crear adjunto'),
  updateWorkOrderAttachment: withToast(services.maintenanceService.updateWorkOrderAttachment, 'Adjunto actualizado exitosamente', 'Error al actualizar adjunto'),
  deleteWorkOrderAttachment: withToast(services.maintenanceService.deleteWorkOrderAttachment, 'Adjunto eliminado exitosamente', 'Error al eliminar adjunto'),
  
  // Legacy providers (for backward compatibility)
  getProviders: services.maintenanceService.getProviders,
  getProvider: services.maintenanceService.getProvider,
  createProvider: withToast(services.maintenanceService.createProvider, 'Proveedor creado exitosamente', 'Error al crear proveedor'),
  updateProvider: withToast(services.maintenanceService.updateProvider, 'Proveedor actualizado exitosamente', 'Error al actualizar proveedor'),
  deleteProvider: withToast(services.maintenanceService.deleteProvider, 'Proveedor eliminado exitosamente', 'Error al eliminar proveedor')
};

// Security Services with Toast
export const securityService = {
  // Visitors
  getVisitors: services.securityService.getVisitors,
  getVisitor: services.securityService.getVisitor,
  createVisitor: withToast(services.securityService.createVisitor, 'Visitante creado exitosamente', 'Error al crear visitante'),
  updateVisitor: withToast(services.securityService.updateVisitor, 'Visitante actualizado exitosamente', 'Error al actualizar visitante'),
  deleteVisitor: withToast(services.securityService.deleteVisitor, 'Visitante eliminado exitosamente', 'Error al eliminar visitante'),
  
  // Access Authorizations
  getAccessAuthorizations: services.securityService.getAccessAuthorizations,
  getAccessAuthorization: services.securityService.getAccessAuthorization,
  createAccessAuthorization: withToast(services.securityService.createAccessAuthorization, 'Autorización creada exitosamente', 'Error al crear autorización'),
  updateAccessAuthorization: withToast(services.securityService.updateAccessAuthorization, 'Autorización actualizada exitosamente', 'Error al actualizar autorización'),
  deleteAccessAuthorization: withToast(services.securityService.deleteAccessAuthorization, 'Autorización eliminada exitosamente', 'Error al eliminar autorización'),
  
  // Access Events
  getAccessEvents: services.securityService.getAccessEvents,
  getAccessEvent: services.securityService.getAccessEvent,
  createAccessEvent: withToast(services.securityService.createAccessEvent, 'Evento de acceso creado exitosamente', 'Error al crear evento de acceso'),
  updateAccessEvent: withToast(services.securityService.updateAccessEvent, 'Evento de acceso actualizado exitosamente', 'Error al actualizar evento de acceso'),
  deleteAccessEvent: withToast(services.securityService.deleteAccessEvent, 'Evento de acceso eliminado exitosamente', 'Error al eliminar evento de acceso'),
  
  // Security Guards
  getSecurityGuards: services.securityService.getSecurityGuards,
  getSecurityGuard: services.securityService.getSecurityGuard,
  createSecurityGuard: withToast(services.securityService.createSecurityGuard, 'Guardia creado exitosamente', 'Error al crear guardia'),
  updateSecurityGuard: withToast(services.securityService.updateSecurityGuard, 'Guardia actualizado exitosamente', 'Error al actualizar guardia'),
  deleteSecurityGuard: withToast(services.securityService.deleteSecurityGuard, 'Guardia eliminado exitosamente', 'Error al eliminar guardia'),
  
  // Security Incidents
  getSecurityIncidents: services.securityService.getSecurityIncidents,
  getSecurityIncident: services.securityService.getSecurityIncident,
  createSecurityIncident: withToast(services.securityService.createSecurityIncident, 'Incidente creado exitosamente', 'Error al crear incidente'),
  updateSecurityIncident: withToast(services.securityService.updateSecurityIncident, 'Incidente actualizado exitosamente', 'Error al actualizar incidente'),
  deleteSecurityIncident: withToast(services.securityService.deleteSecurityIncident, 'Incidente eliminado exitosamente', 'Error al eliminar incidente'),
  
  // Face Recognition
  getFaceEncodings: services.securityService.getFaceEncodings,
  getFaceEncoding: services.securityService.getFaceEncoding,
  createFaceEncoding: withToast(services.securityService.createFaceEncoding, 'Codificación facial creada exitosamente', 'Error al crear codificación facial'),
  updateFaceEncoding: withToast(services.securityService.updateFaceEncoding, 'Codificación facial actualizada exitosamente', 'Error al actualizar codificación facial'),
  deleteFaceEncoding: withToast(services.securityService.deleteFaceEncoding, 'Codificación facial eliminada exitosamente', 'Error al eliminar codificación facial'),
  registerFace: withToast(services.securityService.registerFace, 'Rostro registrado exitosamente', 'Error al registrar rostro'),
  recognizeVisitor: services.securityService.recognizeVisitor,
  
  // Attendance
  getAttendance: services.securityService.getAttendance,
  getAttendanceRecord: services.securityService.getAttendanceRecord,
  createAttendance: withToast(services.securityService.createAttendance, 'Asistencia registrada exitosamente', 'Error al registrar asistencia'),
  updateAttendance: withToast(services.securityService.updateAttendance, 'Asistencia actualizada exitosamente', 'Error al actualizar asistencia'),
  deleteAttendance: withToast(services.securityService.deleteAttendance, 'Asistencia eliminada exitosamente', 'Error al eliminar asistencia'),
  recordAttendance: withToast(services.securityService.recordAttendance, 'Asistencia registrada exitosamente', 'Error al registrar asistencia'),
  getTodayAttendance: services.securityService.getTodayAttendance,
  
  // Legacy faces (for backward compatibility)
  getFaces: services.securityService.getFaces,
  getFace: services.securityService.getFace,
  createFace: withToast(services.securityService.createFace, 'Rostro registrado exitosamente', 'Error al registrar rostro'),
  updateFace: withToast(services.securityService.updateFace, 'Rostro actualizado exitosamente', 'Error al actualizar rostro'),
  deleteFace: withToast(services.securityService.deleteFace, 'Rostro eliminado exitosamente', 'Error al eliminar rostro'),
  
  // Legacy access logs (for backward compatibility)
  getAccessLogs: services.securityService.getAccessLogs,
  getAccessLog: services.securityService.getAccessLog,
  createAccessLog: withToast(services.securityService.createAccessLog, 'Registro de acceso creado exitosamente', 'Error al crear registro de acceso'),
  updateAccessLog: withToast(services.securityService.updateAccessLog, 'Registro de acceso actualizado exitosamente', 'Error al actualizar registro de acceso'),
  deleteAccessLog: withToast(services.securityService.deleteAccessLog, 'Registro de acceso eliminado exitosamente', 'Error al eliminar registro de acceso')
};

// Notices Services with Toast
export const noticesService = {
  getNotices: services.noticesService.getNotices,
  getNotice: services.noticesService.getNotice,
  createNotice: withToast(services.noticesService.createNotice, 'Aviso creado exitosamente', 'Error al crear aviso'),
  updateNotice: withToast(services.noticesService.updateNotice, 'Aviso actualizado exitosamente', 'Error al actualizar aviso'),
  deleteNotice: withToast(services.noticesService.deleteNotice, 'Aviso eliminado exitosamente', 'Error al eliminar aviso')
};

// Reports Services (no toast needed for read-only operations)
export const reportsService = services.reportsService;

// Dashboard Services (no toast needed for read-only operations)
export const dashboardService = services.dashboardService;

// Auth Services (custom toast handling in useAuth)
export const authService = services.authService;
