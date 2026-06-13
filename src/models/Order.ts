import { Table, Model, Column, DataType, AllowNull, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { User } from './User';
import { Supermarket } from './Supermarket';
import { Address } from './Address';
import { PaymentMethod } from './PaymentMethod';
import { Product } from './Product';
import { OrderProduct } from './OrderProduct';

@Table({
    tableName: 'orders',
})
export class Order extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL(10, 2) // Total acumulado del pedido
    })
    declare total: number;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM('activa', 'en proceso','en camino', 'completada', 'cancelada') // Restringe a los estados exactos que definiste
    })
    declare status: 'activa' | 'en proceso'| 'en camino' | 'completada' | 'cancelada';

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;

    @ForeignKey(() => User)
    @AllowNull(true) // Al crearse la orden, aún no tiene repartidor asignado
    @Column({ type: DataType.INTEGER })
    declare deliveryId: number;

    @BelongsTo(() => User, 'deliveryId')
    declare deliveryMan: User;

    @ForeignKey(() => Supermarket)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    declare supermarketId: number;

    @BelongsTo(() => Supermarket)
    declare supermarket: Supermarket;

    @ForeignKey(() => Address)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    declare addressId: number;

    @BelongsTo(() => Address)
    declare address: Address;

    @ForeignKey(() => PaymentMethod)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    declare paymentMethodId: number;

    @BelongsTo(() => PaymentMethod)
    declare paymentMethod: PaymentMethod;

    // Relación de muchos a muchos con Productos a través de la tabla intermedia
    @BelongsToMany(() => Product, () => OrderProduct)
    declare products: Product[];
}

export default Order;