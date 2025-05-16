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