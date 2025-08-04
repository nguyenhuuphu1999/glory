import { DeepPartial, EntityManager, EntityTarget, FindManyOptions, FindOneOptions, FindOptions, FindOptionsOrder, FindOptionsWhere, IsNull, ObjectLiteral, Repository } from "typeorm";
import { AbstractSQLService } from "./base-sql-service";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class BasePostgresRepository<T extends ObjectLiteral> extends AbstractSQLService {
  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityClass: EntityTarget<T>,
  ) {
    super();
  }

  public async findOne(
    rootManager: EntityManager = this.entityManager,
    findCondition: FindOneOptions<T>,
    sort?: {
      by: string,
      type: "ASC" | "DESC"
    },
    relations?: string[]
  ): Promise<T | null> {
    return await rootManager.getRepository(this.entityClass).findOne({
      ...findCondition,
      where: {
        ...findCondition.where,
        deletedAt: IsNull(),
      } as FindOptionsWhere<T>,
      ...(relations ? { relations } : {}),
      ...(sort ? { order: { [sort.by]: sort.type } as FindOptionsOrder<T> } : {})
    });
  }

  public async queries(
    rootManager: EntityManager = this.entityManager,
    findCondition: FindManyOptions<T>,
  ): Promise<T[]> {
    const baseRepo = rootManager.getRepository(this.entityClass);
    const { where, ...rest } = findCondition;
  
    const updatedWhere = Array.isArray(where)
      ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
      : { ...where, deletedAt: IsNull() };
  
    return await baseRepo.find({
      ...rest,
      where: updatedWhere as FindOptionsWhere<T> | FindOptionsWhere<T>[],
    });
  }

  public async insert(
    rootManager: EntityManager = this.entityManager,
    dataCreate: QueryDeepPartialEntity<T>,
  ): Promise<{id: string}> {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const insertResult = await manager
        .getRepository(this.entityClass)
        .insert(dataCreate);
      return {
        id: String(insertResult.identifiers[0].id),
      }
    });
  }

  public async insertMultiple(
    rootManager: EntityManager = this.entityManager,
    dataCreate: QueryDeepPartialEntity<T>[],
  ): Promise<string[]> {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const insertResult = await manager
        .getRepository(this.entityClass)
        .insert(dataCreate);
      return insertResult.identifiers.map(identifier => String(identifier.id));
    });
  }

  public async update(
    rootManager: EntityManager = this.entityManager,
    findCondition: FindManyOptions<T>,
    dataUpdate: QueryDeepPartialEntity<T>,
  ): Promise<boolean> {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const updateResult = await manager.getRepository(this.entityClass).update(
        {
          ...findCondition.where,
          deletedAt: IsNull(),
        } as FindOptionsWhere<T>,
        dataUpdate,
      );
      return updateResult.affected ? updateResult.affected > 0 : false;
    });
  }


  public async softDelete(
    rootManager: EntityManager = this.entityManager,
    findCondition: FindManyOptions<T>,
  ): Promise<boolean> {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const deleteResult = await manager.getRepository(this.entityClass).update(
        {
          ...findCondition.where,
          deletedAt: IsNull(),
        } as FindOptionsWhere<T>,
        { deletedAt: new Date() } as unknown as QueryDeepPartialEntity<T>,
      );
      return deleteResult.affected ? deleteResult.affected > 0 : false;
    });
  }
}