import { ref, watch } from "vue"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "vue-router"
import { api } from "@/lib/api"
// ใช้ตรวจ path หลัง login — ค่ามาจาก LoginView (?redirect=) ต้องผ่านก่อน router.push
import { sanitizeInternalRedirect } from "@/lib/authRedirect"

const user = ref<User | null>(null)
const isReady = ref(false)
const userProfile = ref<{ 
  fullName: string; 
  profilePictureUrl: string | null;
  email?: string;                 
  educationalBackground?: string; 
  age?: number;
  dateOfBirth?: string | null;  
} | null>(null)

export const useAuth = () => {
  const router = useRouter()
  const loading = ref(false)
  const error = ref("")

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/api/users/me")
      userProfile.value = response.data
    } catch (err) {
      console.error("Failed to fetch user profile", err)
    }
  }

  // watch user เมื่อเปลี่ยนแปลงให้ fetch profile ใหม่
  watch(user, async (newUser) => {
    if (newUser) {
      await fetchUserProfile()
    } else {
      userProfile.value = null
    }
  })

  const initSession = async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    isReady.value = true
  }

  initSession()

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })

  const register = async (email: string, password: string) => {
    loading.value = true
    error.value = ""
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) throw err
      user.value = data.user
      router.push("/")
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * @param redirectAfter - path ภายในแอปที่จะไปหลัง login สำเร็จ (optional)
   *   ส่งมาจาก LoginView หลังอ่าน query.redirect แล้ว sanitize แล้ว
   *   ถ้าไม่ส่งหรือไม่ผ่านความปลอดภัย → ไป "/"
   */
  const login = async (email: string, password: string, redirectAfter?: string) => {
    loading.value = true
    error.value = ""
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      user.value = data.user
      const safe = sanitizeInternalRedirect(redirectAfter)
      router.push(safe ?? "/")
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    router.push("/login")
  }

  const getToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  return { user, userProfile, isReady, loading, error, register, login, logout, getToken }
}