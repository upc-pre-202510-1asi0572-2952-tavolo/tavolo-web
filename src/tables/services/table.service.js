import http from '../../shared/services/http-common';

const resource = '/tables';
export default {
  async getAllTables() {
    const response = await http.get(resource);
    return response.data;
  },
  async getTableById(id) {
    const response = await http.get(`${resource}/${id}`);
    return response.data;
  },
  async createTable(tableData) {
    const response = await http.post(resource, tableData);
    return response.data;
  },
  async deleteTable(id) {
    console.log(`Intentando eliminar mesa con ID: ${id}`);
    try {
      const response = await http.post(`${resource}/delete/${id}`);
      console.log(`Mesa ${id} eliminada correctamente con respuesta:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar mesa:', error.response?.data || error.message);
      throw error;
    }
  },
  async getTableSchedule(tableId, date) {
    const response = await http.get(`${resource}/${tableId}/schedule?date=${date}`);
    return response.data;
  },
  getTablesByHeadquarterId(headquarterId) {
    return http.get(`/tables/headquarter/${headquarterId}`);
  },
  getHeadquarterBySupervisorId(supervisorId) {
    return http.get(`/headquarters/supervisors/${supervisorId}`); // Remove leading slash

  }
}; 