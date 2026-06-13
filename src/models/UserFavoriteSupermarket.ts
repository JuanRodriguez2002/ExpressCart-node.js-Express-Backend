import { Table, Model, Column, ForeignKey, DataType } from 'sequelize-typescript';
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
}

export default UserFavoriteSupermarket;