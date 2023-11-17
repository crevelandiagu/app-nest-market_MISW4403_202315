import {Column, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {ProductoEntity} from "../producto/producto.entity";

export class TiendaEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    ciudad: string;

    @Column()
    direccion: string;

    @ManyToMany(() => ProductoEntity,(producto) => producto.tienda,)
    producto: ProductoEntity[];


}
