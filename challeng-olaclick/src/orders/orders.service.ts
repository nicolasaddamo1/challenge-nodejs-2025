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
            rejectOnEmpty: new NotFoundException('Order not found')
        });

        const currentStatus = order.getDataValue('status');

        if (!currentStatus) {
            throw new BadRequestException('Order status is missing');
        }

        const stateTransitions = {
            initiated: { next: 'sent', valid: true },
            sent: { next: 'delivered', valid: true },
            delivered: { next: null, valid: false }
        };

        const transition = stateTransitions[currentStatus];

        if (!transition || !transition.valid) {
            throw new BadRequestException(
                `Cannot advance order from current status: ${currentStatus}`
            );
        }

        if (transition.next === 'delivered') {
            await order.destroy();
            await this.cacheManager.del(`order_${id}`);
            await this.cacheManager.del('orders');
        } else {
            await order.update({ status: transition.next });
            await this.cacheManager.del(`order_${id}`);
            await this.cacheManager.del('orders');
        }

        return {
            success: true,
            orderId: order.id,
            previousStatus: currentStatus,
            newStatus: transition.next,
            timestamp: new Date()
        };
    }
}