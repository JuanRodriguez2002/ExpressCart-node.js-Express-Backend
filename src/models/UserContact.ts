import { Table, Model, Column, DataType, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
    tableName: 'user_contacts',
})
export class UserContact extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.STRING(20)
    })
    declare phoneNumber: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(30) // Ej: 'WhatsApp', 'Teléfono Fijo', 'Trabajo'
    })
    declare type: string;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;
}

export default UserContact;