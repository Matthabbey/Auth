import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AccountState } from '../account-state';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column()
  otp: number;

  @Column({ length: 255, nullable: false})
  phoneNumber: string;

  @Column({ type: 'date', default: '1970-01-01'}) // Column type set to 'date'
  dateOfBirth: Date;

  @Column({ nullable: true })
  resetToken: string;


  @Column({ length: 255 })
  salt: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: AccountState.ACTIVE })
  accountState: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
