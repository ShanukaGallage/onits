import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('Onits@2026', 12);

  // Admin user — full system access
  await prisma.user.upsert({
    where: { email: 'admin@onits.app' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@onits.app',
      passwordHash: password,
      role: 'Admin',
      status: 'Active',
      isFirstLogin: false,
    },
  });

  // Project Manager — can create projects and tasks
  await prisma.user.upsert({
    where: { email: 'pm@onits.app' },
    update: {},
    create: {
      name: 'Project Manager',
      email: 'pm@onits.app',
      passwordHash: password,
      role: 'ProjectManager',
      status: 'Active',
      isFirstLogin: false,
    },
  });

  // Collaborator — view and update assigned tasks only
  await prisma.user.upsert({
    where: { email: 'collab@onits.app' },
    update: {},
    create: {
      name: 'Collaborator User',
      email: 'collab@onits.app',
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