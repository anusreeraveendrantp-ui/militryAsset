import { PrismaClient, Role, EquipmentCategory, TransferStatus, AssignmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data
  await prisma.auditLog.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.assetBalance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.equipmentType.deleteMany();
  await prisma.base.deleteMany();

  // Create Bases
  const baseAlpha = await prisma.base.create({
    data: { name: 'Base Alpha', location: 'Northern Region' },
  });
  const baseBravo = await prisma.base.create({
    data: { name: 'Base Bravo', location: 'Southern Region' },
  });
  const baseCharlie = await prisma.base.create({
    data: { name: 'Base Charlie', location: 'Eastern Region' },
  });

  console.log('✅ Bases created');

  // Create Equipment Types
  const rifle = await prisma.equipmentType.create({
    data: { name: 'Rifle - M4', category: EquipmentCategory.WEAPON },
  });
  const ammo556 = await prisma.equipmentType.create({
    data: { name: 'Ammo - 5.56mm', category: EquipmentCategory.AMMUNITION },
  });
  const apc = await prisma.equipmentType.create({
    data: { name: 'APC - M113', category: EquipmentCategory.VEHICLE },
  });
  const pistol = await prisma.equipmentType.create({
    data: { name: 'Pistol - M9', category: EquipmentCategory.WEAPON },
  });
  const ammo9mm = await prisma.equipmentType.create({
    data: { name: 'Ammo - 9mm', category: EquipmentCategory.AMMUNITION },
  });
  const humvee = await prisma.equipmentType.create({
    data: { name: 'Humvee - M1151', category: EquipmentCategory.VEHICLE },
  });

  console.log('✅ Equipment types created');

  // Create Users
  const adminPass = await bcrypt.hash('Admin@12345', 12);
  const commanderPass = await bcrypt.hash('Commander@123', 12);
  const logisticsPass = await bcrypt.hash('Logistics@123', 12);
  const commander2Pass = await bcrypt.hash('Commander@123', 12);

  const admin = await prisma.user.create({
    data: {
      username: 'admin@mams.mil',
      passwordHash: adminPass,
      role: Role.ADMIN,
      baseId: null,
    },
  });

  const commanderAlpha = await prisma.user.create({
    data: {
      username: 'commander.alpha@mams.mil',
      passwordHash: commanderPass,
      role: Role.BASE_COMMANDER,
      baseId: baseAlpha.id,
    },
  });

  const logisticsOfficer = await prisma.user.create({
    data: {
      username: 'logistics.officer@mams.mil',
      passwordHash: logisticsPass,
      role: Role.LOGISTICS_OFFICER,
      baseId: baseAlpha.id,
    },
  });

  const commanderBravo = await prisma.user.create({
    data: {
      username: 'commander.bravo@mams.mil',
      passwordHash: commander2Pass,
      role: Role.BASE_COMMANDER,
      baseId: baseBravo.id,
    },
  });

  console.log('✅ Users created');

  // Create Purchases
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.purchase.createMany({
    data: [
      {
        baseId: baseAlpha.id,
        equipmentTypeId: rifle.id,
        quantity: 50,
        purchaseDate: new Date(startOfMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
        createdBy: logisticsOfficer.id,
      },
      {
        baseId: baseAlpha.id,
        equipmentTypeId: ammo556.id,
        quantity: 5000,
        purchaseDate: new Date(startOfMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
        createdBy: logisticsOfficer.id,
      },
      {
        baseId: baseAlpha.id,
        equipmentTypeId: apc.id,
        quantity: 5,
        purchaseDate: new Date(startOfMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
        createdBy: logisticsOfficer.id,
      },
      {
        baseId: baseBravo.id,
        equipmentTypeId: pistol.id,
        quantity: 30,
        purchaseDate: new Date(startOfMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
        createdBy: logisticsOfficer.id,
      },
      {
        baseId: baseBravo.id,
        equipmentTypeId: ammo9mm.id,
        quantity: 3000,
        purchaseDate: new Date(startOfMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
        createdBy: logisticsOfficer.id,
      },
      {
        baseId: baseCharlie.id,
        equipmentTypeId: humvee.id,
        quantity: 8,
        purchaseDate: new Date(startOfMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
        createdBy: logisticsOfficer.id,
      },
      {
        baseId: baseCharlie.id,
        equipmentTypeId: rifle.id,
        quantity: 40,
        purchaseDate: new Date(startOfMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
        createdBy: logisticsOfficer.id,
      },
    ],
  });

  console.log('✅ Purchases created');

  // Create Transfers
  const transfer1 = await prisma.transfer.create({
    data: {
      equipmentTypeId: rifle.id,
      quantity: 10,
      fromBaseId: baseAlpha.id,
      toBaseId: baseBravo.id,
      transferDate: new Date(startOfMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: TransferStatus.COMPLETED,
      createdBy: logisticsOfficer.id,
    },
  });

  const transfer2 = await prisma.transfer.create({
    data: {
      equipmentTypeId: ammo556.id,
      quantity: 1000,
      fromBaseId: baseAlpha.id,
      toBaseId: baseCharlie.id,
      transferDate: new Date(startOfMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: TransferStatus.COMPLETED,
      createdBy: logisticsOfficer.id,
    },
  });

  const transfer3 = await prisma.transfer.create({
    data: {
      equipmentTypeId: apc.id,
      quantity: 2,
      fromBaseId: baseAlpha.id,
      toBaseId: baseBravo.id,
      transferDate: new Date(startOfMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      status: TransferStatus.PENDING,
      createdBy: logisticsOfficer.id,
    },
  });

  console.log('✅ Transfers created');

  // Create Assignments
  await prisma.assignment.createMany({
    data: [
      {
        baseId: baseAlpha.id,
        equipmentTypeId: rifle.id,
        assignedTo: 'SGT. John Miller',
        quantity: 1,
        assignedDate: new Date(startOfMonth.getTime() + 8 * 24 * 60 * 60 * 1000),
        status: AssignmentStatus.ASSIGNED,
        createdBy: commanderAlpha.id,
      },
      {
        baseId: baseAlpha.id,
        equipmentTypeId: rifle.id,
        assignedTo: 'CPL. Sarah Connor',
        quantity: 1,
        assignedDate: new Date(startOfMonth.getTime() + 8 * 24 * 60 * 60 * 1000),
        status: AssignmentStatus.ASSIGNED,
        createdBy: commanderAlpha.id,
      },
      {
        baseId: baseBravo.id,
        equipmentTypeId: pistol.id,
        assignedTo: 'LT. James Wilson',
        quantity: 1,
        assignedDate: new Date(startOfMonth.getTime() + 6 * 24 * 60 * 60 * 1000),
        status: AssignmentStatus.RETURNED,
        createdBy: commanderBravo.id,
      },
    ],
  });

  console.log('✅ Assignments created');

  // Create Expenditures
  await prisma.expenditure.createMany({
    data: [
      {
        baseId: baseAlpha.id,
        equipmentTypeId: ammo556.id,
        quantity: 500,
        expenditureDate: new Date(startOfMonth.getTime() + 12 * 24 * 60 * 60 * 1000),
        reason: 'Live fire training exercise',
        createdBy: commanderAlpha.id,
      },
      {
        baseId: baseBravo.id,
        equipmentTypeId: ammo9mm.id,
        quantity: 200,
        expenditureDate: new Date(startOfMonth.getTime() + 9 * 24 * 60 * 60 * 1000),
        reason: 'Combat qualification course',
        createdBy: commanderBravo.id,
      },
    ],
  });

  console.log('✅ Expenditures created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin:              admin@mams.mil         / Admin@12345');
  console.log('  Base Commander:     commander.alpha@mams.mil / Commander@123');
  console.log('  Base Commander:     commander.bravo@mams.mil / Commander@123');
  console.log('  Logistics Officer:  logistics.officer@mams.mil / Logistics@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
