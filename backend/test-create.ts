import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = '9303a85a267d382fab30ccfc29f426dc070ef294ef6752fbb885343da9dd27dc595fd1c425ed7d725cf693e839b7962f58b0d511b1d196c2a3b233595445e047';

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log('No user found');

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { algorithm: 'HS256' });

  const formData = new FormData();
  formData.append('name', 'Test Project');
  formData.append('projectKey', 'TEST3');
  formData.append('visibility', 'PUBLIC');
  formData.append('description', 'This is a test');
  formData.append('colorCode', '#4648d4');
  
  // Serialize just like the frontend
  formData.append('tags', JSON.stringify(['Tag1', 'Tag2']));
  
  const links = [{title: 'Google', url: 'https://google.com'}];
  const stringifiedLinks = links.map(l => JSON.stringify(l));
  formData.append('externalLinks', JSON.stringify(stringifiedLinks));

  const res = await fetch('http://localhost:5000/api/projects', {
    method: 'POST',
    headers: {
      cookie: `token=${token}`
    },
    body: formData as any,
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
