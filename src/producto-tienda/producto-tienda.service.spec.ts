import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { ProductoTiendaService } from './producto-tienda.service';
import {ProductoEntity} from "../producto/producto.entity";
import {TiendaEntity} from "../tienda/tienda.entity";


describe('ProductoTiendaService', () => {
  let service: ProductoTiendaService;
  let productoRepository: Repository<ProductoEntity>;
  let tiendaRepository: Repository<TiendaEntity>;
  let producto: ProductoEntity;
  let tiendaList : TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoTiendaService],
    }).compile();

    service = module.get<ProductoTiendaService>(ProductoTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    tiendaRepository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    productoRepository.clear();
    tiendaRepository.clear();

    tiendaList = [];
    for(let i = 0; i < 5; i++){
      const store: TiendaEntity = await tiendaRepository.save({
        nombre: faker.company.buzzPhrase(),
        ciudad: faker.location.countryCode('alpha-3'),
        direccion: faker.location.city(),
      });
      tiendaList.push(store);
    }

    producto = await productoRepository.save({
      nombre: faker.person.bio(),
      precio: faker.number.int(),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
      tienda: tiendaList
    })
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addStoreToProduct should add an store to a product', async () => {
    const newStore: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.buzzPhrase(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.city(),
    });

    const newProduct: ProductoEntity = await productoRepository.save({
      nombre: faker.person.bio(),
      precio: faker.number.int(),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
    })

    const result: ProductoEntity = await service.addStoreToProduct(newProduct.id, newStore.id);

    expect(result.tienda.length).toBe(1);
    expect(result.tienda[0]).not.toBeNull();
    expect(result.tienda[0].nombre).toBe(newStore.nombre)
    expect(result.tienda[0].ciudad).toBe(newStore.ciudad)
    expect(result.tienda[0].direccion).toBe(newStore.direccion)

  });

  it('addStoreToProduct should thrown exception for an invalid store', async () => {
    const newProduct: ProductoEntity = await productoRepository.save({
      nombre: faker.person.bio(),
      precio: faker.number.int(),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
    })

    await expect(() => service.addStoreToProduct(newProduct.id, "0")).rejects.toHaveProperty(
        "message",
        "No se encontró la tienda con la identificación proporcionada.");
  });

  it('addStoreToProduct should throw an exception for an invalid product', async () => {
    const newStore: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.buzzPhrase(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.city(),
    });

    await expect(() => service.addStoreToProduct("0", newStore.id)).rejects.toHaveProperty(
        "message",
        "No se encontró el producto con la identificación proporcionada.");
  });

  it('findStoreFromProduct should return store by product', async () => {
    const store: TiendaEntity = tiendaList[0];
    const storedStore: TiendaEntity = await service.findStoreFromProduct(producto.id, store.id, )
    expect(storedStore).not.toBeNull();
    expect(storedStore.nombre).toBe(store.nombre);
    expect(storedStore.ciudad).toBe(store.ciudad);
    expect(storedStore.direccion).toBe(store.direccion);
  });

  it('findStoreFromProduct should throw an exception for an invalid store', async () => {
    await expect(()=> service.findStoreFromProduct(producto.id, "0")).rejects.toHaveProperty(
        "message",
        "No se encontró la tienda con la identificación proporcionada.");
  });

  it('findStoreFromProduct should throw an exception for an invalid product', async () => {
    const store: TiendaEntity = tiendaList[0];
    await expect(()=> service.findStoreFromProduct("0", store.id)).rejects.toHaveProperty(
        "message",
        "No se encontró el producto con la identificación proporcionada.");
  });

  it('findStoreFromProduct should throw an exception for an store not associated to the product', async () => {
    const newStore: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.buzzPhrase(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.city(),
    });

    await expect(()=> service.findStoreFromProduct(producto.id, newStore.id)).rejects.toHaveProperty(
        "message",
        "La tienda con la identificación proporcionada no está asociada al producto.");
  });

  it('findStoresFromProduct should return stores by product', async ()=>{
    const stores: TiendaEntity[] = await service.findStoresFromProduct(producto.id);
    expect(stores.length).toBe(5)
  });

  it('findStoresFromProduct should throw an exception for an invalid product', async () => {
    await expect(()=> service.findStoresFromProduct("0")).rejects.toHaveProperty(
        "message",
        "No se encontró el producto con la identificación proporcionada.");
  });

  it('updateStoresFromProduct should update stores list for a product', async () => {
    const newStore: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.buzzPhrase(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.city(),
    });

    const updatedProduct: ProductoEntity = await service.updateStoresFromProduct(producto.id, [newStore]);
    expect(updatedProduct.tienda.length).toBe(1);

    expect(updatedProduct.tienda[0].nombre).toBe(newStore.nombre);
    expect(updatedProduct.tienda[0].ciudad).toBe(newStore.ciudad);
    expect(updatedProduct.tienda[0].direccion).toBe(newStore.direccion);
  });

  it('updateStoresFromProduct should throw an exception for an invalid product', async () => {
    const newStore: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.buzzPhrase(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.city(),
    });

    await expect(()=> service.updateStoresFromProduct("0", [newStore])).rejects.toHaveProperty(
        "message",
        "No se encontró el producto con la identificación proporcionada.");
  });

  it('updateStoresFromProduct should throw an exception for an invalid store', async () => {
    const newStore: TiendaEntity = tiendaList[0];
    newStore.id = "0";

    await expect(()=> service.updateStoresFromProduct(producto.id, [newStore])).rejects.toHaveProperty(
        "message",
        "No se encontró la tienda con la identificación proporcionada.");
  });

  it('deleteStoreFromProduct should remove an store from a product', async () => {
    const store: TiendaEntity = tiendaList[0];

    await service.deleteStoreFromProduct(producto.id, store.id);

    const storedProduct: ProductoEntity = await productoRepository.findOne({where: {id: producto.id}, relations: ["tienda"]});
    const deletedStore: TiendaEntity = storedProduct.tienda.find(a => a.id === store.id);

    expect(deletedStore).toBeUndefined();

  });

  it('deleteStoreFromProduct should thrown an exception for an invalid store', async () => {
    await expect(()=> service.deleteStoreFromProduct(producto.id, "0")).rejects.toHaveProperty(
        "message",
        "No se encontró la tienda con la identificación proporcionada.");
  });

  it('deleteStoreFromProduct should thrown an exception for an invalid product', async () => {
    const store: TiendaEntity = tiendaList[0];
    await expect(()=> service.deleteStoreFromProduct("0", store.id)).rejects.toHaveProperty(
        "message",
        "No se encontró el producto con la identificación proporcionada.");
  });

  it('deleteStoreFromProduct should thrown an exception for an non asocciated store', async () => {
    const newStore: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.buzzPhrase(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.city(),
    });

    await expect(()=> service.deleteStoreFromProduct(producto.id, newStore.id)).rejects.toHaveProperty(
        "message",
        "La tienda con la identificación proporcionada no está asociada al producto.");
  });

});
