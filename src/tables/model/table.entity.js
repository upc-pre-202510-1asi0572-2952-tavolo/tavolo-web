export class TableEntity {
  constructor(id, headquarterId, tableNumber, seats, status, zone = 'MAIN_HALL') {
    this.id = id;
    this.headquarterId = headquarterId;
    this.tableNumber = tableNumber;
    this.seats = seats;
    this.status = status;
    this.zone = zone;
  }

  // Obtener nombre en español para la zona
  getZoneDisplayName() {
    const zoneTranslations = {
      'MAIN_HALL': 'Sala principal',
      'WINDOW': 'Ventana',
      'TERRACE': 'Terraza'
    };
    return zoneTranslations[this.zone] || this.zone;
  }
}