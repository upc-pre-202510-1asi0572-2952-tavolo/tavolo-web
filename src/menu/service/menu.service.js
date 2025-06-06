import http from "@/shared/services/http-common.js";

export class MenuService {
    resourceEndpoint = import.meta.env.VITE_MENU_ENDPOINT_PATH;

    getAllMenuItems() {
        return http.get(`${this.resourceEndpoint}`);
    }

    getMenuItemById(itemId) {
        return http.get(`${this.resourceEndpoint}/${itemId}`);
    }

    getMenuItemsByCategory(category) {
        return http.get(`${this.resourceEndpoint}/category/${category}`);
    }

    createMenuItem(menuItem) {
        return http.post(`${this.resourceEndpoint}`, menuItem);
    }

    updateMenuItem(itemId, menuItem) {
        return http.put(`${this.resourceEndpoint}/${itemId}`, menuItem);
    }

    deleteMenuItem(itemId) {
        return http.delete(`${this.resourceEndpoint}/${itemId}`);
    }
    getAllCategories() {
        return http.get(`${this.resourceEndpoint}/categories`);
    }
}