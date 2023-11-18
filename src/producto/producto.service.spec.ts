import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

import { ProductoService } from './producto.service';
import { ProductoEntity } from "./producto.entity";

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: Repository<ProductoEntity>;
  let productoList: ProductoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoService],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get<Repository<ProductoEntity>>(
        getRepositoryToken(ProductoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    productoList = [];
    for (let i = 0; i < 5; i++) {
      const product: ProductoEntity = await repository.save({
        nombre: faker.person.bio(),
        precio: faker.number.int(),
        tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
      });
      productoList.push(product);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all products', async () => {
    const product: ProductoEntity[] = await service.findAll();
    expect(product).not.toBeNull();
    expect(product).toHaveLength(productoList.length);
  });

  it('findOne should return a products by id', async () => {
    const storedProducto: ProductoEntity = productoList[0];
    const product: ProductoEntity = await service.findOne(storedProducto.id);
    expect(product).not.toBeNull();
    expect(product.nombre).toEqual(storedProducto.nombre)
    expect(product.precio).toEqual(storedProducto.precio)
    expect(product.tipo).toEqual(storedProducto.tipo)
  });

  it('findOne should throw an exception for an invalid product', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty(
        "message",
        "No se encontró el producto con la identificación proporcionada.")
  });

  it('create should return a new product', async () => {
    const product: ProductoEntity = {
      id: "",
      nombre: faker.person.bio(),
      precio: faker.number.int(),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
      tienda: []
    }

    const newProduct: ProductoEntity = await service.create(product);
    expect(newProduct).not.toBeNull();

    const storedProduct: ProductoEntity = await repository.findOne({where: {id: newProduct.id}})
    expect(storedProduct).not.toBeNull();
    expect(storedProduct.nombre).toEqual(newProduct.nombre)
    expect(storedProduct.precio).toEqual(newProduct.precio)
    expect(storedProduct.tipo).toEqual(newProduct.tipo)
  });

  it('create hould throw an exception for an invalid product type', async () => {
    const product: ProductoEntity = {
      id: "",
      nombre: faker.person.bio(),
      precio: faker.number.int(),
      tipo: faker.person.bio(),
      tienda: []
    }
    await expect(() => service.create(product)).rejects.toHaveProperty(
        "message",
        "El producto no tiene el tipo Perecedero o No perecedero")
  });


  it('update should modify a product', async () => {
    const product: ProductoEntity = productoList[0];
    product.nombre = "New name";
    product.precio = 10000;
    const updatedProduct: ProductoEntity = await service.update(product.id, product);
    expect(updatedProduct).not.toBeNull();
    const storedProduct: ProductoEntity = await repository.findOne({ where: { id: product.id } })
    expect(storedProduct).not.toBeNull();
    expect(storedProduct.nombre).toEqual(storedProduct.nombre)
    expect(storedProduct.precio).toEqual(storedProduct.precio)
  });

  it('update should throw an exception for an invalid product type', async () => {
    const product: ProductoEntity = productoList[0];
    product.nombre = "New name";
    product.precio = 10000;
    product.tipo = ""
    await expect(() => service.update(product.id, product)).rejects.toHaveProperty(
        "message",
        "El producto no tiene el tipo Perecedero o No perecedero")

  });


  it('update should throw an exception for an invalid product', async () => {
    let product: ProductoEntity = productoList[0];
    product = {
      ...product, nombre: "New name", precio: 10000
    }
    await expect(() => service.update("0", product)).rejects.toHaveProperty(
        "message",
        "El producto con el id dado no existe")
  });

  it('delete should remove a product', async () => {
    const product: ProductoEntity = productoList[0];
    await service.delete(product.id);
    const deletedProduct: ProductoEntity = await repository.findOne({ where: { id: product.id } })
    expect(deletedProduct).toBeNull();
  });

  it('delete should throw an exception for an invalid product', async () => {
    const product: ProductoEntity = productoList[0];
    await expect(() => service.delete("0")).rejects.toHaveProperty(
        "message",
        "El producto con el id dado no fue encontrado")
  });

});
