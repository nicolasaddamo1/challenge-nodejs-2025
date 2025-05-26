// src/orders/orders-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './entities/order.model';
import { Op } from 'sequelize';

@Injectable()
export class OrdersCleanupService {
    private readonly logger = new Logger(OrdersCleanupService.name);

    constructor(
        @InjectModel(Order)
        private orderModel: typeof Order,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);

        const result = await this.orderModel.destroy({
            where: {
                status: 'delivered',
                updatedAt: {
                    [Op.lt]: cutoffDate,
                },
            },
        });

        this.logger.log(`Eliminadas ${result} órdenes antiguas entregadas`);
    }
}