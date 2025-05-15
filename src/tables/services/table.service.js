import http from '../../shared/services/http-common';

const resource = '/tables';

/**
 * Servicio para gestionar las mesas del restaurante
 */
export default {
  /**
   * Obtiene todas las mesas
   * @returns {Promise<Array>} - Promesa con la lista de mesas
   */
  async getAllTables() {
    const response = await http.get(resource);
    return response.data;
  },

  /**
   * Obtiene una mesa por su ID
   * @param {number} id - ID de la mesa
   * @returns {Promise<Object>} - Promesa con los datos de la mesa
   */
  async getTableById(id) {
    const response = await http.get(`${resource}/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva mesa
   * @param {Object} tableData - Datos de la mesa a crear
   * @returns {Promise<Object>} - Promesa con la mesa creada
   */
  async createTable(tableData) {
    const response = await http.post(resource, tableData);
    return response.data;
  },

  /**
   * Elimina una mesa por su ID usando una solicitud POST a /delete/{id}
   * @param {number} id - ID de la mesa a eliminar
   * @returns {Promise<void>}
   */
  async deleteTable(id) {
    console.log(`Intentando eliminar mesa con ID: ${id}`);
    try {
      // Los backends de Spring Boot a menudo utilizan una ruta específica para operaciones de eliminación
      // en lugar de DELETE HTTP
      const response = await http.post(`${resource}/delete/${id}`);
      console.log(`Mesa ${id} eliminada correctamente con respuesta:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar mesa:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtiene la programación de disponibilidad de una mesa para una fecha específica
   * @param {number} tableId - ID de la mesa
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>} - Promesa con los slots de disponibilidad
   */
  async getTableSchedule(tableId, date) {
    const response = await http.get(`${resource}/${tableId}/schedule?date=${date}`);
    return response.data;
  }
}; 