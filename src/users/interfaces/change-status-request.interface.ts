import { AccountState } from '../account-state';
import { CahngeAccountStatusDTO } from '../dtos';

export class ChangeStatusRequest extends CahngeAccountStatusDTO {
  readonly id: string;
  readonly state: AccountState;
}
