import { ChatSession } from "../interfaces/types";
import { MenuService } from "./MenuService";
import { Order } from "../models/Order";
import { PaystackService } from "./PaystackService";

export class BotService {
    
    static async processMessage(session: any, message: string): Promise<string> {
        const input = message.trim();
        const currentOrder = session.currentOrder || [];

        // 1. Initial / Welcome
        if (!session.hasStarted) {
            session.hasStarted = true;
            return this.getMainMenu();
        }

        // 2. Main Command Parsing
        switch (input) {
            case '1':
                return this.renderMenu();
            
            case '99': // Checkout
                if (currentOrder.length === 0) return "No order to place. Select 1 to see menu.";
                return await this.handleCheckout(session);

            case '98': // History
                return await this.getOrderHistory(session.id);

            case '97': // Current Order
                return this.formatCurrentOrder(currentOrder);

            case '0': // Cancel
                if (currentOrder.length === 0) return "No active order to cancel.";
                session.currentOrder = [];
                return "Order cancelled. Cart is now empty.\n" + this.getMainMenu();
        }

        // 3. Item Selection Logic (If input matches a Menu ID)
        const itemId = parseInt(input);
        const item = MenuService.getItem(itemId);

        if (item) {
            session.currentOrder = session.currentOrder || [];
            session.currentOrder.push({ ...item, quantity: 1 });
            return `${item.name} added to cart!\nSelect another item number or:\n99. Checkout\n97. View Cart\n0. Cancel`;
        }

        // 4. Fallback
        return "Invalid selection. Please verify the number.\n" + this.getMainMenu();
    }

    private static getMainMenu(): string {
        return `Welcome to FoodBot! 🤖\nSelect an option:\n1. Place an order\n99. Checkout order\n98. See order history\n97. See current order\n0. Cancel order`;
    }

    private static renderMenu(): string {
        const items = MenuService.getMenu();
        let response = "🍔 **Our Menu** 🍔\n";
        items.forEach(item => {
            response += `${item.id}. ${item.name} - ₦${item.price}\n`;
        });
        response += "\nType the Item Number to add to your cart.";
        return response;
    }

    private static formatCurrentOrder(order: any[]): string {
        if (!order || order.length === 0) return "Your cart is empty.";
        let response = "🛒 **Current Order**\n";
        let total = 0;
        order.forEach((item, index) => {
            response += `${index + 1}. ${item.name} - ₦${item.price}\n`;
            total += item.price;
        });
        response += `\n**Total:** ₦${total}`;
        return response;
    }

    private static async handleCheckout(session: any): Promise<string> {
        const orderItems = session.currentOrder;
        const total = orderItems.reduce((sum: number, item: any) => sum + item.price, 0);
        
        // Create Pending Order
        const newOrder = await Order.create({
            sessionId: session.id,
            items: orderItems,
            totalAmount: total,
            status: 'pending',
            paymentReference: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        });

        // Generate Payment Link
        // Note: Using a dummy email as strict auth isn't required by prompt, but Paystack needs one.
        const paymentUrl = await PaystackService.initializeTransaction(
            "customer@example.com", 
            total, 
            newOrder.paymentReference!
        );

        if (paymentUrl) {
            // Clear cart immediately so they don't double order, or wait for webhook? 
            // For simplicity, we keep cart until verified, but here we assume intent to pay.
            return `Order placed! 💸\nTotal: ₦${total}\n\n<a href="${paymentUrl}" target="_blank" class="pay-btn">Click here to Pay Now</a>`;
        } else {
            return "Error initializing payment. Please try again.";
        }
    }

    private static async getOrderHistory(sessionId: string): Promise<string> {
        const orders = await Order.find({ sessionId: sessionId, status: 'paid' }).sort({ createdAt: -1 });
        if (orders.length === 0) return "No previous paid orders found.";
        
        let response = "📜 **Order History**\n";
        orders.forEach((ord, i) => {
            response += `\n${i+1}. Date: ${ord.createdAt.toLocaleDateString()}\n   Items: ${ord.items.map(x => x.name).join(', ')}\n   Total: ₦${ord.totalAmount}\n`;
        });
        return response;
    }
}