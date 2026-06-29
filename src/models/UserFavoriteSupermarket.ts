import { Table, Model, Column, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import User from './User';
import Supermarket from './Supermarket';

@Table({
    tableName: 'user_favorite_supermarkets',
    timestamps: true // Para saber cuándo lo agregó a favoritos
})
export class UserFavoriteSupermarket extends Model {

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare userId: number;

    @ForeignKey(() => Supermarket)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare supermarketId: number;

    @BelongsTo(() => Supermarket)
    declare supermarket: Supermarket;
}

export default UserFavoriteSupermarket;