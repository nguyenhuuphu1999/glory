import { EntityManager } from "typeorm";

export type SQLMethodName = `sql${string}`;

export abstract class AbstractSQLService {
  [K: SQLMethodName]: (manager?: EntityManager, ...args: never[]) => unknown;

  protected async mergeTransaction<T>(
    manager: EntityManager,
    runInTransaction: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    if (manager.queryRunner?.isTransactionActive) {
      return runInTransaction(manager);
    } else {
      return manager.transaction(runInTransaction);
    }
  }
}
