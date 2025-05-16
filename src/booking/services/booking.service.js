import http from '@/shared/services/http-common.js';

export class BookingService {

endpoint = '/bookings';

async getBookingsByClientId(clientId) {
    try {
        return await http.get(`${this.endpoint}/client/${clientId}`);
    } catch (error) {
        // Check if it's a 404 with the specific "No bookings found" message
        if (error.response?.status === 404 &&
            error.response?.data?.message?.includes('No bookings found for client')) {
            // Return empty array instead of throwing an error
            return { data: [] };
        }
        // Re-throw other errors
        throw error;
    }
}

async delete(id) {
 return http.delete(`${this.endpoint}/${id}`);
}

async create(booking) {
 return http.post(this.endpoint, booking);
}

async getById(id) {
 return http.get(`${this.endpoint}/${id}`);
}

async update(id, booking) {
 return http.put(`${this.endpoint}/${id}`, booking);
}
}