"use server";
 
// Simulasi Server Action untuk pengujian UI (Mockup)
export async function verifyVoterPin(pin: string) {
  // Simulasi jeda jaringan selama 1.5 detik
  await new Promise((resolve) => setTimeout(resolve, 1500));
 
  // Simulasi logika database: Anggap "123456" adalah PIN yang benar
  if (pin === "123456") {
    return { success: true };
  }
 
  // Jika PIN selain 123456, kembalikan pesan error
  return {
    success: false,
    error: "PIN tidak terdaftar atau sudah digunakan. Silakan cek kembali.",
  };
}


 
import { createClient } from "@/utils/supabase/server";
 
export async function loginAdmin(formData: FormData) {
  const email = formData.get("username") as string;
  const password = formData.get("password") as string;
 
  if (!email || !password) {
    return { success: false, error: "Email dan password wajib diisi." };
  }
 
  try {
    const supabase = await createClient();
 
    // 1. Autentikasi akun ke Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
 
   if (authError) {
  console.log(authError);

  return {
    success: false,
    error: authError.message,
  };
}
 
    // 2. Otorisasi: Periksa apakah user ID ini ada di tabel 'admins'
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("role")
      .eq("id", authData.user.id)
      .single();
 
    if (adminError || !adminData) {
      // Jika tidak terdaftar di tabel admin, paksa logout demi keamanan sistem
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Akses ditolak. Anda bukan administrator resmi.",
      };
    }
 
    return { success: true, role: adminData.role };
  } catch (err) {
    console.error("Kesalahan sistem saat login admin:", err);
    return { success: false, error: "Terjadi kesalahan internal pada server." };
  }
}
 
export async function logoutAdmin() {
  try {
	const supabase = await createClient();
	// Memerintahkan Supabase untuk menghapus sesi aktif
	await supabase.auth.signOut();
	return { success: true };
  } catch (err) {
	console.error("Kesalahan sistem saat logou:", err);
	return { success: false, error: "Gagal melakukan logout." };
  }
}