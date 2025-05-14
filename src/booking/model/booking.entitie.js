import { BookingSlot } from './booking-slot.entitie.js';

/**
 * @class Booking
 * @description Representa una reserva de mesa en el sistema
 */
export class Booking {
    /**
     * Crea una nueva instancia de Booking
     * @param {Object} params - Los parámetros de inicialización de la reserva
     * @param {number|string} [params.id=''] - Identificador único de la reserva
     * @param {number|string} [params.clientId=''] - Identificador del cliente que realiza la reserva
     * @param {number} [params.tableNumber=0] - Número de mesa reservada
     * @param {number|string} [params.headquarterId=''] - Identificador de la sede
     * @param {number|string} [params.tableId=''] - Identificador único de la mesa
     * @param {string} [params.bookingDate=''] - Fecha de la reserva en formato YYYY-MM-DD
     * @param {Array} [params.bookingSlots=[]] - Array de slots de tiempo para la reserva
     */
    constructor({
        id = '', 
        clientId = '', 
        tableNumber = 0, 
        headquarterId = '', 
        tableId = '', 
        bookingDate = '', 
        bookingSlots = []
    }) {
        /**
         * @type {number|string}
         * @description Identificador único de la reserva
         */
        this.id = id;
        
        /**
         * @type {number|string}
         * @description Identificador del cliente que realiza la reserva
         */
        this.clientId = clientId;
        
        /**
         * @type {number}
         * @description Número de mesa reservada
         */
        this.tableNumber = tableNumber;
        
        /**
         * @type {number|string}
         * @description Identificador de la sede
         */
        this.headquarterId = headquarterId;
        
        /**
         * @type {number|string}
         * @description Identificador único de la mesa
         */
        this.tableId = tableId;
        
        /**
         * @type {string}
         * @description Fecha de la reserva en formato YYYY-MM-DD
         */
        this.bookingDate = bookingDate;
        
        /**
         * @type {Array<BookingSlot>}
         * @description Array de slots de tiempo para la reserva
         */
        this.bookingSlots = bookingSlots.map(slot => 
            slot instanceof BookingSlot ? slot : new BookingSlot(slot)
        );
    }
    
    /**
     * Convierte un objeto JSON de respuesta API a una instancia de Booking
     * @param {Object} data - Datos de respuesta de la API
     * @returns {Booking} Nueva instancia de Booking
     */
    static fromJson(data) {
        return new Booking({
            id: data.id,
            clientId: data.clientId,
            tableNumber: data.tableNumber,
            headquarterId: data.headquarterId,
            tableId: data.tableId,
            bookingDate: data.bookingDate,
            bookingSlots: data.bookingSlots || []
        });
    }
}