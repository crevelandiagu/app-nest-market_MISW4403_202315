import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

import { TiendaService } from './tienda.service';
import { TiendaEntity } from "./tienda.entity";



describe('TiendaService', () => {
  let service: TiendaService;
  let repository: Repository<TiendaEntity>;
  let tiendaList: TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TiendaService],
    }).compile();

    service = module.get<TiendaService>(TiendaService);
    repository = module.get<Repository<TiendaEntity>>(
        getRepositoryToken(TiendaEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    tiendaList = [];
    for(let i = 0; i < 5; i++){
      const store: TiendaEntity = await repository.save({
        nombre: faker.company.buzzPhrase(),
        ciudad: faker.location.countryCode('alpha-3'),
        direccion: faker.location.city(),
      });
        tiendaList.push(store);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all store', async () => {
    const store: TiendaEntity[] = await service.findAll();
    expect(store).not.toBeNull();
    expect(store).toHaveLength(tiendaList.length);
  });

  it('findOne should return a store by id', async () => {
    const storedStore: TiendaEntity = tiendaList[0];
    const store: TiendaEntity = await service.findOne(storedStore.id);
    expect(store).not.toBeNull();
    expect(store.nombre).toEqual(storedStore.nombre)
    expect(store.ciudad).toEqual(storedStore.ciudad)
    expect(store.direccion).toEqual(storedStore.direccion)
  });

  it('findOne should throw an exception for an invalid store', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty(
        "message",
        "No se encontró la tienda con la identificación proporcionada.")
  });

  it('create should return a new store', async () => {
    const store: TiendaEntity = {
      id: "",
      nombre: faker.company.buzzPhrase(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.city(),
      producto: [],
    }

    const newStore: TiendaEntity = await service.create(store);
    expect(newStore).not.toBeNull();

    const storedStore: TiendaEntity = await repository.findOne({where: {id: newStore.id}})
    expect(storedStore).not.toBeNull();
    expect(storedStore.nombre).toEqual(newStore.nombre)
    expect(storedStore.ciudad).toEqual(newStore.ciudad)
    expect(storedStore.direccion).toEqual(newStore.direccion)
  });

  it('create hould throw an exception for an invalid store country', async () => {
    const store: TiendaEntity = {
      id: "",
      nombre: faker.company.buzzPhrase(),
      ciudad: faker.location.city(),
      direccion: faker.location.city(),
      producto: [],
    }
    await expect(() => service.create(store)).rejects.toHaveProperty(
        "message",
        "El tienda no tiene la ciudad de la forma ABC (3 letras y mayusculas)")
  });

  it('update should modify a store', async () => {
    const store: TiendaEntity = tiendaList[0];
    store.nombre = "New name";
    store.ciudad = "ABC";

    const updatedStore: TiendaEntity = await service.update(store.id, store);
    expect(updatedStore).not.toBeNull();

    const storedStore: TiendaEntity = await repository.findOne({ where: { id: store.id } })
    expect(storedStore).not.toBeNull();
    expect(storedStore.nombre).toEqual(store.nombre)
    expect(storedStore.ciudad).toEqual(store.ciudad)
  });

  it('update should throw an exception for an invalid store country', async () => {
    const store: TiendaEntity = tiendaList[0];
    store.nombre = "New name";
    store.ciudad = "abc";
    store.direccion = "123 fake"
    await expect(() => service.update(store.id, store)).rejects.toHaveProperty(
        "message",
        "El tienda no tiene la ciudad de la forma ABC (3 letras y mayusculas)")
  });

  it('update should throw an exception for an invalid store', async () => {
    let store: TiendaEntity = tiendaList[0];
    store = {
      ...store, nombre: "New name", ciudad: "ABC"
    }
    await expect(() => service.update("0", store)).rejects.toHaveProperty(
        "message",
        "La tienda con el id dado no existe")
  });

  it('delete should remove a store', async () => {
    const store: TiendaEntity = tiendaList[0];
    await service.delete(store.id);

    const deletedMuseum: TiendaEntity = await repository.findOne({ where: { id: store.id } })
    expect(deletedMuseum).toBeNull();
  });

  it('delete should throw an exception for an invalid store', async () => {
    const store: TiendaEntity = tiendaList[0];
    await service.delete(store.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty(
        "message",
        "La tienda con el id dado no fue encontrado")
  });

});


