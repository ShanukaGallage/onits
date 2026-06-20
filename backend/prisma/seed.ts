import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('Onits@2026', 12);

  const NAMESPACE = process.env.TESTMAIL_NAMESPACE || 'mjuqg';

// Admin user
await prisma.user.upsert({
  where: { username: 'admin' },        // ← was: { email: `${NAMESPACE}...` }
  update: {
    email: `${NAMESPACE}.admin@inbox.testmail.app`,
    name: 'Admin User',
    passwordHash: password,
    role: 'Admin',
    status: 'Active',
    isFirstLogin: false,
  },
  create: {
    name: 'Admin User',
    email: `${NAMESPACE}.admin@inbox.testmail.app`,
    username: 'admin',
    passwordHash: password,
    role: 'Admin',
    status: 'Active',
    isFirstLogin: false,
  },
});

// Project Manager
await prisma.user.upsert({
  where: { username: 'pm_user' },      // ← was: { email: `${NAMESPACE}...` }
  update: {
    email: `${NAMESPACE}.pm@inbox.testmail.app`,
    name: 'Project Manager',
    passwordHash: password,
    role: 'ProjectManager',
    status: 'Active',
    isFirstLogin: false,
  },
  create: {
    name: 'Project Manager',
    email: `${NAMESPACE}.pm@inbox.testmail.app`,
    username: 'pm_user',
    passwordHash: password,
    role: 'ProjectManager',
    status: 'Active',
    isFirstLogin: false,
  },
});

// Collaborator
await prisma.user.upsert({
  where: { username: 'collab_user' },  // ← was: { email: `${NAMESPACE}...` }
  update: {
    email: `${NAMESPACE}.collab@inbox.testmail.app`,
    name: 'Collaborator User',
    passwordHash: password,
    role: 'Collaborator',
    status: 'Active',
    isFirstLogin: false,
  },
  create: {
    name: 'Collaborator User',
    email: `${NAMESPACE}.collab@inbox.testmail.app`,
    username: 'collab_user',
    passwordHash: password,
    role: 'Collaborator',
    status: 'Active',
    isFirstLogin: false,
  },
});

  console.log('Seeding complete.');
  console.log('  admin@onits.app    → Admin');
  console.log('  pm@onits.app       → ProjectManager');
  console.log('  collab@onits.app   → Collaborator');
  console.log('  Password for all:    OnIts@2026');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());