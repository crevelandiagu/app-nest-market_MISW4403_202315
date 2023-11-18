import {Column, Entity, ManyToMany, PrimaryGeneratedColumn, JoinTable} from 'typeorm';
import {TiendaEntity} from "../tienda/tienda.entity";

@Entity()
export class ProductoEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    precio: number;

    @Column()
    tipo: string;

    @ManyToMany(() => TiendaEntity, tienda => tienda.producto)
    tienda: TiendaEntity[];

}
