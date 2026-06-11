import bcrypt from 'bcryptjs';
import { BCRYPT_COST } from '../../shared/constants.js';

const password = process.env.DEFAULT_AUTHORITY_PASSWORD || 'ChangeMe@123';

(async () => {
  const hash = await bcrypt.hash(password, BCRYPT_COST);
  console.log(JSON.stringify({ badgeNumber: 'AAT-0001', passwordHash: hash }, null, 2));
})();
