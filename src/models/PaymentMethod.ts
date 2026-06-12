import { Table, Model, Column, DataType, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
    tableName: 'payment_methods',
})
export class PaymentMethod extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.STRING(30) // Ej: 'Efectivo', 'Tarjeta de Crédito', 'Transferencia'
    })
    declare provider: string;

    @Column({
        type: DataType.STRING(4) // Para mostrar en el perfil los últimos 4 dígitos (Ej: '4321')
    })
    declare lastFourDigits: string;

    @Column({
        type: DataType.STRING(255) // Token de pasarela de pago (Ej: Stripe/PayPal) en el futuro
    })
    declare paymentToken: string;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;
}

export default PaymentMethod;