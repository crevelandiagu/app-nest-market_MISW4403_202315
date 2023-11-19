import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import {ProductoEntity} from "../producto/producto.entity";
import {TiendaEntity} from "../tienda/tienda.entity";

@Injectable()
export class ProductoTiendaService {

    constructor(
        @InjectRepository(ProductoEntity)
        private readonly productoRepository: Repository<ProductoEntity>,

        @InjectRepository(TiendaEntity)
        private readonly tiendaRepository: Repository<TiendaEntity>
    ) {}

    async addStoreToProduct(productId: string, tiendaId: string): Promise<ProductoEntity> {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId} } );
        if (!tienda)
            throw new BusinessLogicException("No se encontró la tienda con la identificación proporcionada.", BusinessError.NOT_FOUND);

        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productId}, relations: ["tienda"] } );
        if (!producto)
            throw new BusinessLogicException("No se encontró el producto con la identificación proporcionada.", BusinessError.NOT_FOUND);

        producto.tienda = [...producto.tienda, tienda];
        return await this.productoRepository.save(producto);
    }

    async findStoresFromProduct(productId: string): Promise<TiendaEntity[]> {
        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productId}, relations: ["tienda"] } );
        if (!producto)
            throw new BusinessLogicException("No se encontró el producto con la identificación proporcionada.", BusinessError.NOT_FOUND);

        return producto.tienda;
    }

    async findStoreFromProduct(productId: string, tiendaId: string): Promise<TiendaEntity> {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId} } );
        if (!tienda)
            throw new BusinessLogicException("No se encontró la tienda con la identificación proporcionada.", BusinessError.NOT_FOUND);

        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productId}, relations: ["tienda"] } );
        if (!producto)
            throw new BusinessLogicException("No se encontró el producto con la identificación proporcionada.", BusinessError.NOT_FOUND);

        const productStore: TiendaEntity = producto.tienda.find(e => e.id === tienda.id);

        if (!productStore)
            throw new BusinessLogicException("La tienda con la identificación proporcionada no está asociada al producto.", BusinessError.PRECONDITION_FAILED)

        return productStore;
    }

    async updateStoresFromProduct(productId: string, stores: TiendaEntity[]): Promise<ProductoEntity> {
        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productId}, relations: ["tienda"] } );
        if (!producto)
            throw new BusinessLogicException("No se encontró el producto con la identificación proporcionada.", BusinessError.NOT_FOUND);

        for (let i = 0; i < stores.length; i++) {
            const store: TiendaEntity = await this.tiendaRepository.findOne({where: {id: stores[i].id}});
            if (!store)
                throw new BusinessLogicException("No se encontró la tienda con la identificación proporcionada.", BusinessError.NOT_FOUND);
        }

        producto.tienda = stores;
        return await this.productoRepository.save(producto);
    }

    async deleteStoreFromProduct(productId: string, tiendaId: string){
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId} } );
        if (!tienda)
            throw new BusinessLogicException("No se encontró la tienda con la identificación proporcionada.", BusinessError.NOT_FOUND);

        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productId}, relations: ["tienda"] } );
        if (!producto)
            throw new BusinessLogicException("No se encontró el producto con la identificación proporcionada.", BusinessError.NOT_FOUND);

         const productStore: TiendaEntity = producto.tienda.find(e => e.id === tienda.id);

        if (!productStore)
            throw new BusinessLogicException("La tienda con la identificación proporcionada no está asociada al producto.", BusinessError.PRECONDITION_FAILED)

        producto.tienda = producto.tienda.filter(e => e.id !== tiendaId);
        await this.productoRepository.save(producto);

    }
}
