import { BookingSlot } from './booking-slot.entitie.js';

export class Booking {
    constructor({id = '',clientId = '', tableNumber = 0, headquarterId = '', tableId = '', bookingDate = '', bookingSlots = []
    }) {
        this.id = id;
        this.clientId = clientId;
        this.tableNumber = tableNumber;
        this.headquarterId = headquarterId;
        this.tableId = tableId;
        this.bookingDate = bookingDate;
        this.bookingSlots = bookingSlots.map(slot =>
            slot instanceof BookingSlot ? slot : new BookingSlot(slot)
        );
    }
    static fromJson(json) {
        return new Booking(json);
    }
}