import { MenuItem } from "../interfaces/types";

export class MenuService {
    // Using IDs starting at 10 to avoid conflict with command numbers (0, 1, 99)
    private static menu: MenuItem[] = [
        { id: 10, name: "Jollof Rice & Chicken", price: 2500 },
        { id: 11, name: "Fried Rice & Turkey", price: 3000 },
        { id: 12, name: "Yam & Egg Sauce", price: 1500 },
        { id: 13, name: "Pepper Soup", price: 2000 },
        { id: 14, name: "Cold Chapman", price: 1000 }
    ];

    static getMenu(): MenuItem[] {
        return this.menu;
    }

    static getItem(id: number): MenuItem | undefined {
        return this.menu.find(item => item.id === id);
    }
}