export class HeadquarterEntity {
    constructor(id, name, landlinePhone, mobilePhone, latitude, longitude, streetAddress, openingTime, closingTime, intervalMinutes) {
        this.id = id;
        this.name = name;
        this.landlinePhone = landlinePhone;
        this.mobilePhone = mobilePhone;
        this.latitude = latitude;
        this.longitude = longitude;
        this.streetAddress = streetAddress;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.intervalMinutes = intervalMinutes;
    }
}