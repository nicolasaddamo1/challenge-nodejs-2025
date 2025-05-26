import { Table, Column, Model, HasMany, DataType } from 'sequelize-typescript';
import { OrderItem } from './order-item.model';

@Table({ tableName: 'orders', paranoid: true })
export class Order extends Model {
    @Column({
        type: DataType.ENUM('initiated', 'sent', 'delivered'),
        defaultValue: 'initiated'
    })
    status: string;

    @Column
    clientName: string;

    @HasMany(() => OrderItem)
    items: OrderItem[];

    @Column({
        field: 'deleted_at',
        allowNull: true,
    })
    declare deletedAt: Date;
}