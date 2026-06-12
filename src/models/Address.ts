import { Table, Model, Column, DataType, AllowNull, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { User } from './User';

@Table({
    tableName: 'addresses',
})
export class Address extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.STRING(255) // Dirección completa (Calle, Sector, número)
    })
    declare fullAddress: string;

    @Column({
        type: DataType.STRING(100) // Notas opcionales de entrega (Ej: 'Frente al parque')
    })
    declare references: string;

    @Default(false)
    @AllowNull(false)
    @Column({
        type: DataType.BOOLEAN
    })
    declare isDefault: boolean;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;
}

export default Address;