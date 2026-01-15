export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findByEmail(email: string): Promise<T | null>;
  create(data: T): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}
