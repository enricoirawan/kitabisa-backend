import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  // Seeding Category
  await prisma.category.createMany({
    data: [
      {
        name: 'Wakaf',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/hj0zt0gawfwznqnpg51v.png',
      },
      {
        name: 'Panti Asuhan',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/b4g3j9oyznygdhmwagqo.png',
      },
      {
        name: 'Olahraga',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/isjovq8b5t1sdq2px4yn.png',
      },
      {
        name: 'Kemanusiaan',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/gp1axyitnzrrappsjhl1.png',
      },
      {
        name: 'Zakat',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/vrwz5nqho3lbouqxrqep.png',
      },
      {
        name: 'Rumah Ibadah',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/j6fn25whfdzuakt2nspz.png',
      },
      {
        name: 'Lingkungan',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/duiw1fqz0mbc3cnaejtv.png',
      },
      {
        name: 'Menolong Hewan',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/jycebopln4s7c1dl3gnu.png',
      },
      {
        name: 'Difabel',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/rifr7r2kpe40pdiep1ey.png',
      },
      {
        name: 'Karya Kreatif & Modal Usaha',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/keczgpig6eavq30qi07j.png',
      },
      {
        name: 'Kegiatan Sosial',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/zhseflfuscyypd1mofew.png',
      },
      {
        name: 'Bantuan Pendidikan',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/pvqpja0bigqsdglzxews.png',
      },
      {
        name: 'Infrastruktur Umum',
        imageUrl:
          'http://res.cloudinary.com/dfcnewgj0/image/upload/v1740226428/vitcp9jrlmsztdgeqloy.png',
      },
    ],
  });
  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
