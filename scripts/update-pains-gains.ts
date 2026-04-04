/**
 * Update Rekam stories with richer pains & gains data.
 * Run with: npx tsx scripts/update-pains-gains.ts
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', connect_timeout: 30 });

const updates: Record<string, { pains: string[]; gains: string[] }> = {
	S1: {
		pains: ['Proses registrasi terlalu panjang', 'Harus verifikasi email dan NIM', 'Lupa password sering terjadi'],
		gains: ['Onboarding cepat, langsung bisa akses', 'Single sign-on dengan akun kampus']
	},
	S2: {
		pains: ['Keyword tidak ditemukan', 'Hasil pencarian tidak relevan', 'Filter lomba terlalu sedikit'],
		gains: ['Ditemukan karya yang relevan', 'Bisa filter berdasarkan lomba dan tahun', 'Rekomendasi karya serupa']
	},
	S3: {
		pains: ['Tidak bisa lihat isi dokumen', 'Loading preview terlalu lama', 'Watermark mengganggu bacaan'],
		gains: ['Bisa lihat 3-5 slide pertama', 'Preview cepat dan ringan', 'Informasi metadata lengkap']
	},
	S4: {
		pains: ['Upload gagal tanpa error', 'Format file tidak didukung', 'Batas ukuran file terlalu kecil'],
		gains: ['Upload berhasil dengan perlindungan', 'Auto-watermark langsung aktif', 'Bisa atur visibilitas publik/privat']
	},
	S5: {
		pains: ['Anggota tim tidak teridentifikasi', 'Sulit koordinasi persetujuan tim', 'Tidak tahu siapa yang sudah approve'],
		gains: ['Semua anggota terasosiasi', 'Notifikasi otomatis ke anggota', 'Status persetujuan transparan']
	},
	S6: {
		pains: ['Tidak ada kontrol akses', 'Tidak tahu siapa yang lihat karya', 'Akses bocor ke pihak tidak diinginkan'],
		gains: ['Kontrol penuh, bisa cabut akses', 'Log akses tercatat', 'Bisa set expiry waktu akses']
	},
	S7: {
		pains: ['Tidak ada kontak kreator', 'Chat lewat DM Instagram tidak profesional', 'Pesan sering tidak dibalas'],
		gains: ['Kontak langsung via WhatsApp', 'Template pesan otomatis tersedia', 'Respons lebih cepat dan profesional']
	},
	S8: {
		pains: ['Prestasi tidak terdokumentasi', 'Portofolio tersebar di banyak tempat', 'Tidak ada halaman publik yang rapi'],
		gains: ['Profil profesional', 'Semua karya terkumpul di satu halaman', 'Bisa dibagikan ke rekruter']
	},
	S9: {
		pains: ['Tidak ada cara apresiasi', 'Kreator tidak tahu karyanya diminati', 'Tidak ada feedback dari pembaca'],
		gains: ['Apresiasi ke kreator', 'Kreator termotivasi berbagi lebih', 'Bisa lihat karya populer']
	}
};

async function main() {
	for (const [code, data] of Object.entries(updates)) {
		const result = await sql`
			UPDATE story
			SET pains = ${JSON.stringify(data.pains)}::jsonb,
			    gains = ${JSON.stringify(data.gains)}::jsonb
			WHERE code = ${code}
			RETURNING id, code
		`;
		if (result.length > 0) {
			console.log(`Updated ${code}: ${data.pains.length} pains, ${data.gains.length} gains`);
		} else {
			console.log(`Skipped ${code}: not found`);
		}
	}
	console.log('\nDone!');
	await sql.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
