/**
 * @class BookingSlot
 * @description Representa un slot de tiempo para una reserva
 */
export class BookingSlot {
    /**
     * Crea una nueva instancia de BookingSlot
     * @param {Object} params - Los parámetros de inicialización del slot
     * @param {string} [params.startTime=''] - Hora de inicio del slot (formato HH:MM)
     * @param {string} [params.endTime=''] - Hora de finalización del slot (formato HH:MM)
     */
    constructor({startTime = '', endTime = ''}) {
        /**
         * @type {string}
         * @description Hora de inicio del slot en formato HH:MM
         */
        this.startTime = startTime;
        
        /**
         * @type {string}
         * @description Hora de finalización del slot en formato HH:MM
         */
        this.endTime = endTime;
    }
}