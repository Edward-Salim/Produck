/**
 * Replace fake Rekam personas with real ones from PRD.
 * Run with: bun run scripts/reseed-rekam-personas.ts
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

const [rekam] = await db
	.select()
	.from(schema.project)
	.where(eq(schema.project.name, 'Rekam (Referensi Karya Mahasiswa)'));

if (!rekam) {
	console.error('Rekam project not found');
	process.exit(1);
}

// Delete old fake personas
await db.delete(schema.persona).where(eq(schema.persona.projectId, rekam.id));
console.log('Deleted old personas');

// Insert real personas from PRD
await db.insert(schema.persona).values([
	{
		projectId: rekam.id,
		name: 'Kreator Putri',
		role: 'Mahasiswa aktif, pemenang lomba Business Plan',
		age: '20-22',
		quote: 'Kalau untuk portofolio secara publik general luas tuh aku enggak pernah share sih ke mereka gitu.',
		goals: [
			'Memamerkan portofolio lomba sebagai rekam jejak',
			'Mendapat rekognisi dari rekruter',
			'Memperoleh penghasilan tambahan'
		],
		challenges: [
			'Ide rawan diplagiasi pesaing',
			'File berharga di Google Drive rawan bocor',
			'Karya tim butuh persetujuan semua anggota sebelum dipublikasi'
		],
		motivators: [
			'Pengakuan profesional',
			'Passive income',
			'Membantu adik tingkat'
		],
		infoSources: [
			'LinkedIn',
			'Grup WhatsApp lomba',
			'Komunitas Fasilkom'
		],
		sortOrder: 0
	},
	{
		projectId: rekam.id,
		name: 'Pencari Adi',
		role: 'Mahasiswa aktif, calon peserta lomba',
		age: '18-20',
		quote: 'Orang tuh akses itu perlu pengorbanan loh. Enggak cuma-cuma.',
		goals: [
			'Meningkatkan kualitas karya lomba dengan belajar dari pemenang',
			'Memahami standar dan pola karya juara'
		],
		challenges: [
			'Tidak tahu harus cari referensi di mana',
			'Tidak kenal senior pemenang',
			'Referensi di internet tidak spesifik untuk lomba Indonesia'
		],
		motivators: [
			'Keinginan menang lomba',
			'Membangun portofolio sejak dini',
			'Meningkatkan CV'
		],
		infoSources: [
			'Google',
			'LinkedIn',
			'Info dari teman sekelas',
			'Portal agregator lomba'
		],
		sortOrder: 1
	}
]);

console.log('Done: 2 real personas seeded from PRD');
await client.end();
