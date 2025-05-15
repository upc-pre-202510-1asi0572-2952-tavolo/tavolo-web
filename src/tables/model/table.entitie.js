/**
 * Clase que representa una mesa en el restaurante
 */
export class Table {
  /**
   * @param {number} id - Identificador único de la mesa
   * @param {number} headquarterId - ID de la sede a la que pertenece
   * @param {number} tableNumber - Número de mesa
   * @param {number} seats - Capacidad de personas
   * @param {string} status - Estado de la mesa (AVAILABLE, RESERVED, OCCUPIED)
   * @param {string} zone - Zona donde está ubicada la mesa (opcional)
   */
  constructor(id, headquarterId, tableNumber, seats, status, zone = 'Sala principal') {
    this.id = id;
    this.headquarterId = headquarterId;
    this.tableNumber = tableNumber;
    this.seats = seats;
    this.status = status;
    this.zone = zone;
  }

  /**
   * Crea una instancia de Table a partir de un objeto JSON recibido del backend
   * @param {Object} json - Objeto JSON con los datos de la mesa
   * @returns {Table} - Nueva instancia de Table
   */
  static fromJson(json) {
    return new Table(
      json.id,
      json.headquarterId,
      json.tableNumber,
      json.seats,
      json.status,
      json.zone || 'Sala principal'
    );
  }

  /**
   * Convierte la instancia actual a un objeto JSON para enviar al backend
   * @returns {Object} - Objeto JSON listo para enviar al API
   */
  toJson() {
    return {
      id: this.id,
      headquarterId: this.headquarterId,
      tableNumber: this.tableNumber,
      seats: this.seats,
      status: this.status,
      zone: this.zone
    };
  }

  /**
   * Crea un objeto para enviar en la creación de una nueva mesa
   * @returns {Object} - Objeto JSON para crear una mesa
   */
  toCreateJson() {
    return {
      headquarterId: this.headquarterId,
      tableNumber: this.tableNumber,
      seats: this.seats
    };
  }
} 