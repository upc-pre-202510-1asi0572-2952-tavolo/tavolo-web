import http from "../../shared/services/http-common.js";

/**
 * @class BookingService
 * @description Servicio para gestionar operaciones CRUD de reservas mediante peticiones HTTP
 */
export class BookingService {
    /** @type {string} La ruta del endpoint para reservas */
    resourceEndpoint = import.meta.env.VITE_BOOKINGS_ENDPOINT_PATH;

    /**
     * Obtiene todas las reservas
     * @returns {Promise<AxiosResponse<any>>} Promesa que resuelve a un array de reservas
     */
    getAll() {
        return http.get(this.resourceEndpoint);
    }

    /**
     * Obtiene una reserva por su ID
     * @param {number|string} id - ID de la reserva a obtener
     * @returns {Promise<AxiosResponse<any>>} Promesa que resuelve al objeto de reserva
     */
    getById(id) {
        return http.get(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Obtiene todas las reservas de un cliente específico
     * @param {number|string} clientId - ID del cliente
     * @returns {Promise<AxiosResponse<any>>} Promesa que resuelve a un array de reservas del cliente
     */
    getBookingsByClientId(clientId) {
        return http.get(`${this.resourceEndpoint}/client/${clientId}`);
    }

    /**
     * Crea una nueva reserva
     * @param {Object} resource - Objeto de reserva a crear
     * @returns {Promise<AxiosResponse<any>>} Promesa que resuelve a la reserva creada
     */
    create(resource) {
        return http.post(this.resourceEndpoint, resource);
    }

    /**
     * Actualiza una reserva existente
     * @param {number|string} id - ID de la reserva a actualizar
     * @param {Object} resource - Datos actualizados de la reserva
     * @returns {Promise<AxiosResponse<any>>} Promesa que resuelve a la reserva actualizada
     */
    update(id, resource) {
        return http.put(`${this.resourceEndpoint}/${id}`, resource);
    }

    /**
     * Elimina una reserva por su ID
     * @param {number|string} id - ID de la reserva a eliminar
     * @returns {Promise<AxiosResponse<any>>} Promesa que se resuelve cuando la reserva es eliminada
     */
    delete(id) {
        return http.delete(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Obtiene reservas por fecha
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @returns {Promise<AxiosResponse<any>>} Promesa que resuelve a un array de reservas para esa fecha
     */
    getByDate(date) {
        return http.get(`${this.resourceEndpoint}/date/${date}`);
    }

    /**
     * Obtiene reservas por sede
     * @param {number|string} headquarterId - ID de la sede
     * @returns {Promise<AxiosResponse<any>>} Promesa que resuelve a un array de reservas para esa sede
     */
    getByHeadquarter(headquarterId) {
        return http.get(`${this.resourceEndpoint}/headquarter/${headquarterId}`);
    }

    /**
     * Verifica la disponibilidad de mesas para una fecha y hora específicas
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @param {string} startTime - Hora de inicio en formato HH:MM
     * @param {string} endTime - Hora de finalización en formato HH:MM
     * @param {number|string} [headquarterId] - ID de la sede (opcional)
     * @returns {Promise<AxiosResponse<any>>} Promesa que resuelve a un array de mesas disponibles
     */
    checkAvailability(date, startTime, endTime, headquarterId) {
        let url = `${this.resourceEndpoint}/availability?date=${date}&startTime=${startTime}&endTime=${endTime}`;
        
        if (headquarterId) {
            url += `&headquarterId=${headquarterId}`;
        }
        
        return http.get(url);
    }

}