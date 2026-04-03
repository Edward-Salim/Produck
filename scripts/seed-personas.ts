/**
 * Seed personas for Rekam project.
 * Run with: bun run scripts/seed-personas.ts
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// Find Rekam project
const [rekam] = await db
	.select()
	.from(schema.project)
	.where(eq(schema.project.name, 'Rekam (Referensi Karya Mahasiswa)'));

if (!rekam) {
	console.error('Rekam project not found');
	process.exit(1);
}

console.log(`Seeding personas for project: ${rekam.name} (id: ${rekam.id})`);

await db.insert(schema.persona).values([
	{
		projectId: rekam.id,
		name: 'Naila Putri',
		role: 'Mahasiswa Aktif Lomba',
		jobDescription: 'Mahasiswa S1 Sistem Informasi semester 5 yang aktif mengikuti kompetisi bisnis dan teknologi tingkat nasional.',
		companyName: 'Universitas Indonesia',
		companySize: '40.000+ mahasiswa',
		industry: 'Pendidikan Tinggi',
		age: '20',
		gender: 'Perempuan',
		income: 'Rp 1-2 juta/bulan (uang saku)',
		educationLevel: 'S1 (sedang berjalan)',
		residentialEnvironment: 'Kos dekat kampus, urban',
		quote: 'Saya selalu cari referensi karya pemenang sebelum mulai lomba, tapi susah banget nemunya. Kebanyakan cuma judul doang, nggak bisa lihat isinya.',
		biography: 'Naila sudah ikut 8 lomba sejak semester 2. Pernah juara 3 di kompetisi business case nasional. Dia sering frustrasi karena harus mulai dari nol tanpa referensi karya pemenang sebelumnya. Biasanya dia cari di Google Drive yang dibagikan senior, tapi link-nya sering mati.',
		goals: [
			'Menemukan referensi karya pemenang lomba yang relevan',
			'Meningkatkan kualitas proposal agar menang lebih sering',
			'Membangun portofolio kompetisi untuk CV',
			'Belajar dari struktur dan strategi pemenang sebelumnya'
		],
		challenges: [
			'Referensi karya pemenang sangat sulit ditemukan secara online',
			'Link Google Drive dari senior sering expired atau restricted',
			'Tidak tahu standar kualitas yang diharapkan juri',
			'Waktu persiapan lomba terbatas, butuh referensi cepat'
		],
		motivators: [
			'Ingin membanggakan keluarga dengan prestasi',
			'Beasiswa dan hadiah uang dari kompetisi',
			'Membangun personal brand untuk karir setelah lulus',
			'Kompetisi antar teman sebaya yang sehat'
		],
		infoSources: [
			'Instagram komunitas lomba (@infolombamahasiswa)',
			'Grup WhatsApp dan LINE lomba kampus',
			'LinkedIn alumni yang sering menang',
			'Website penyelenggara lomba'
		],
		sortOrder: 0
	},
	{
		projectId: rekam.id,
		name: 'Rafansya Eka',
		role: 'Kreator / Pemenang Lomba',
		jobDescription: 'Mahasiswa S1 Teknik Informatika semester 7, sudah memenangkan 5+ lomba nasional dan ingin karyanya bermanfaat bagi junior.',
		companyName: 'Institut Teknologi Bandung',
		companySize: '25.000+ mahasiswa',
		industry: 'Pendidikan Tinggi',
		age: '22',
		gender: 'Laki-laki',
		income: 'Rp 3-5 juta/bulan (freelance + hadiah lomba)',
		educationLevel: 'S1 (semester akhir)',
		residentialEnvironment: 'Kos, suburban Bandung',
		quote: 'Saya mau share karya saya biar adik-adik kelas bisa belajar, tapi takut diplagiasi. Kalau ada platform yang bisa protect sekaligus showcase, saya pasti upload.',
		biography: 'Rafansya dikenal sebagai "raja lomba" di angkatannya. Sudah memenangkan kompetisi dari Gemastik, FIND IT, hingga hackathon bank. Dia ingin memberikan kontribusi ke ekosistem lomba tapi khawatir karya originalnya dicuri. Saat ini dia simpan semua karya di Google Drive pribadi yang hanya dibagikan ke teman dekat.',
		goals: [
			'Membagikan karya tanpa risiko plagiasi',
			'Mendapat rekognisi dan visibility dari karya',
			'Membantu junior meningkatkan kualitas lomba',
			'Membangun portofolio publik yang profesional'
		],
		challenges: [
			'Tidak ada platform yang melindungi karya dari copy-paste',
			'Google Drive sharing tidak ada watermark atau DRM',
			'Sulit mengontrol siapa yang melihat dan menyebarkan',
			'Tidak ada cara mendapat kredit/atribusi dari karya yang dishare'
		],
		motivators: [
			'Altruisme: ingin ekosistem lomba Indonesia lebih kuat',
			'Personal branding untuk apply kerja/beasiswa',
			'Potensi monetisasi (jual akses premium)',
			'Rekognisi dari komunitas kampus'
		],
		infoSources: [
			'LinkedIn dan portfolio website pribadi',
			'Komunitas developer (Discord, Telegram)',
			'Medium dan blog teknis',
			'Event kampus dan webinar'
		],
		sortOrder: 1
	},
	{
		projectId: rekam.id,
		name: 'Arisha Dewi',
		role: 'Mahasiswa Baru / First-timer',
		jobDescription: 'Mahasiswa S1 Manajemen semester 3 yang baru pertama kali ingin ikut lomba tapi tidak tahu harus mulai dari mana.',
		companyName: 'Universitas Gadjah Mada',
		companySize: '55.000+ mahasiswa',
		industry: 'Pendidikan Tinggi',
		age: '19',
		gender: 'Perempuan',
		income: 'Rp 1-1.5 juta/bulan (uang saku)',
		educationLevel: 'S1 (semester awal)',
		residentialEnvironment: 'Asrama kampus',
		quote: 'Teman-teman saya pada ikut lomba tapi saya nggak tahu caranya bikin proposal yang bagus. Kalau bisa lihat contoh dari yang pernah menang, pasti lebih PD.',
		biography: 'Arisha baru pindah dari Makassar ke Yogyakarta untuk kuliah. Dia melihat teman-teman seangkatannya sudah aktif lomba dan merasa tertinggal. Belum punya koneksi senior yang bisa membimbing. Dia butuh referensi visual yang bisa langsung dipelajari, bukan hanya tips abstrak di artikel blog.',
		goals: [
			'Memahami format dan standar proposal lomba yang baik',
			'Mendapat kepercayaan diri untuk ikut lomba pertama',
			'Terhubung dengan kreator/pemenang untuk belajar',
			'Membangun track record kompetisi sejak dini'
		],
		challenges: [
			'Nol pengalaman lomba, tidak tahu standar kualitas',
			'Tidak punya koneksi senior yang bisa jadi mentor',
			'Artikel tips lomba terlalu abstrak, butuh contoh nyata',
			'Intimidated oleh gap kualitas antara karyanya dan pemenang'
		],
		motivators: [
			'FOMO melihat teman sudah aktif lomba',
			'Ingin CV yang kuat untuk magang semester 5',
			'Dorongan orang tua untuk berprestasi',
			'Hadiah uang untuk tambahan biaya kuliah'
		],
		infoSources: [
			'TikTok dan Instagram tips mahasiswa',
			'Grup WhatsApp angkatan dan organisasi kampus',
			'Kakak angkatan yang sudah berpengalaman',
			'Website kampus tentang info lomba'
		],
		sortOrder: 2
	}
]);

console.log('Done: 3 personas seeded for Rekam');
await client.end();
