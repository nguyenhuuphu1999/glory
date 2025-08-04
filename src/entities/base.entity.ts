import { IBase } from 'src/intefaces/base.interface';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class BaseEntity implements IBase {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @CreateDateColumn({ type: 'timestamp' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    public updatedAt: Date;

    @Column({
        default: null,
        type: Date
    })
    public deletedAt?: Date;


    @Column({ type: 'uuid', nullable: true, default: null })
    public createdById?: string;

    @Column({ type: 'uuid', nullable: true, default: null })
    public updatedById?: string;

    @Column({ type: 'uuid', nullable: true, default: null })
    public deletedById?: string;
}
