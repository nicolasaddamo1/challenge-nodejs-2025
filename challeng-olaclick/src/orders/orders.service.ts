import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Order } from './entities/order.model';
import { OrderItem } from './entities/order-item.model';
import { CreateOrderDto } from './dto/create-orders.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order)
        private orderModel: typeof Order,
        @InjectModel(OrderItem)
        private orderItemModel: typeof OrderItem,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }
    async findOne(id: number) {
        const cachedKey = `order_${id}`;
        const cached = await this.cacheManager.get(cachedKey);
        if (cached) return cached;

        const order = await this.orderModel.findByPk(id, {
            include: [OrderItem]
        });

        if (!order) throw new NotFoundException('Order not found');

        await this.cacheManager.set(cachedKey, order, 30000);
        return order;
    }

    async findAll() {
        const cached = await this.cacheManager.get('orders');
        if (cached) return cached;

        const orders = await this.orderModel.findAll({
            where: { status: { [Op.ne]: 'delivered' } },
            include: [OrderItem]
        });

        await this.cacheManager.set('orders', orders, 30000);
        return orders;
    }

    async create(createOrderDto: CreateOrderDto) {
        const order = await this.orderModel.create({
            clientName: createOrderDto.clientName,
            status: 'initiated'
        });

        const items = await this.orderItemModel.bulkCreate(
            createOrderDto.items.map(item => ({
                ...item,
                orderId: order.id
            }))
        );

        await this.cacheManager.del('orders');
        return { ...order.toJSON(), items };
    }
    async advanceOrder(id: number) {
        const order = await this.orderModel.findByPk(id, {
            paranoid: false,
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.deletedAt) throw new BadRequestException('Order was already delivered and removed');

        const stateMachine = {
            initiated: 'sent',
            sent: 'delivered',
            delivered: null
        };

        const nextStatus = stateMachine[order.status];

        if (!nextStatus) {
            throw new BadRequestException(`Order cannot be advanced from status ${order.status}`);
        }

        if (nextStatus === 'delivered') {
            await order.destroy();
            await this.cacheManager.del(`order_${id}`);
            await this.cacheManager.del('orders');
        } else {
            await order.update({ status: nextStatus });
            await this.cacheManager.del(`order_${id}`);
            await this.cacheManager.del('orders');
        }

        return {
            id: order.id,
            previousStatus: order.status,
            newStatus: nextStatus,
            timestamp: new Date().toISOString()
        };
    }
}