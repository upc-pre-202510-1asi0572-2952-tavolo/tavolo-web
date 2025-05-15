import http from "@/shared/services/http-common.js";

export class ReservationService {
    resourceEndpoint = import.meta.env.VITE_BOOKINGS_ENDPOINT_PATH;

    getTableSchedule(tableId, date) {
        // Quita /api/v1/ ya que http-common.js ya tiene configurada la URL base
        return http.get(`/tables/${tableId}/schedule?date=${date}`);
    }
    async createReservation(reservationData) {
        return http.post(this.resourceEndpoint, reservationData);
    }
}