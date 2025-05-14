// src/booking/services/tables.service.js
import http from "@/shared/services/http-common.js";

export class TablesService {
    resourceEndpoint = import.meta.env.VITE_TABLES_ENDPOINT_PATH;

    async getAllTables() {
        return http.get(this.resourceEndpoint);
    }

    async getTableById(tableId) {
        return http.get(`${this.resourceEndpoint}/${tableId}`);
    }


    async getTablesByHeadquarter(headquarterId) {
        return http.get(`${this.resourceEndpoint}/headquarter/${headquarterId}`);
    }

    async createTable(tableData) {
        return http.post(this.resourceEndpoint, tableData);
    }

    async getTableSchedule(tableId, date) {
        return http.get(`${this.resourceEndpoint}/${tableId}/schedule?date=${date}`);
    }
}