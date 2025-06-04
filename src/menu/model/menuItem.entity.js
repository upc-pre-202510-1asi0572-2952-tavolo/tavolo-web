export class MenuItemEntity {
    constructor(name, description, price, category, imageBase64) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.imageBase64 = imageBase64;
    }
}