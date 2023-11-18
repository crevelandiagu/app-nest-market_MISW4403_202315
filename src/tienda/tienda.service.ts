import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TiendaEntity} from "./tienda.entity";
import {Repository} from "typeorm";
import {BusinessError, BusinessLogicException} from "../shared/errors/business-errors";


@Injectable()
export class TiendaService {

    constructor(
        @InjectRepository(TiendaEntity)
        private readonly tiendaRepository: Repository<TiendaEntity>
    ){}

    async findAll(): Promise<TiendaEntity[]> {
        return await this.tiendaRepository.find({ relations: ["producto",] });
    }

    async findOne(id: string): Promise<TiendaEntity> {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id}, relations: ["producto"] } );
        if (!tienda)
            throw new BusinessLogicException("No se encontró la tienda con la identificación proporcionada.", BusinessError.NOT_FOUND);

        return tienda;
    }

    async create(tienda: TiendaEntity): Promise<TiendaEntity> {
        // tres caracteres (e.g., SMR, BOG, MED).
        let tiendaCiudad = tienda.ciudad
        if (/^([A-Z]{3,})$/.test(tiendaCiudad))
            return await this.tiendaRepository.save(tienda);
        throw new BusinessLogicException("El tienda no tiene la ciudad de la forma ABC (3 letras y mayusculas)", BusinessError.PRECONDITION_FAILED);
    }

    async update(id: string, tienda: TiendaEntity): Promise<TiendaEntity> {
        const persistedTienda: TiendaEntity = await this.tiendaRepository.findOne({where:{id}});
        if (!persistedTienda)
            throw new BusinessLogicException("La tienda con el id dado no existe", BusinessError.NOT_FOUND);
        // tres caracteres (e.g., SMR, BOG, MED).
        let tiendaCiudad = tienda.ciudad
        if (/^([A-Z]{3,})$/.test(tiendaCiudad))
            return await this.tiendaRepository.save({...persistedTienda, ...tienda});
        throw new BusinessLogicException("El tienda no tiene la ciudad de la forma ABC (3 letras y mayusculas)", BusinessError.PRECONDITION_FAILED);

    }

    async delete(id: string) {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where:{id}});
        if (!tienda)
            throw new BusinessLogicException("La tienda con el id dado no fue encontrado", BusinessError.NOT_FOUND);

        await this.tiendaRepository.remove(tienda);
    }

}
