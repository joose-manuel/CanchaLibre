import 'reflect-metadata';
import 'tsconfig-paths/register';
import 'dotenv/config';
import dataSource from './data-source';
import { runSeed } from './seed-data';

async function main(): Promise<void> {
  const demo = !['false', '0', 'no', 'off'].includes(
    (process.env.SEED_DEMO_DATA ?? 'true').toLowerCase(),
  );

  await dataSource.initialize();
  try {
    const result = await runSeed(dataSource, demo);
    console.log(
      `Semilla aplicada: ${result.cities} ciudades, ${result.sports} deportes, demo=${
        result.demo ? 'sí' : 'no'
      }`,
    );
    if (result.demo) {
      console.log('Credenciales demo:');
      console.log('  owner@canchalibre.co / CanchaLibre123*');
      console.log('  player@canchalibre.co / CanchaLibre123*');
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
